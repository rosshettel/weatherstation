'use strict';

var app = angular.module('weatherstation', ['angular-skycons', 'ngRoute', 'highcharts-ng']);

app.factory('DarkSky', function ($http, $interval, config) {
    var interval = 1000 * 60 * 5,  //5 minutes, we get 1000 free calls a day
        cachedForecast;

    function pollDarkSky(callback) {
        var url = [
                'https://api.darksky.net/forecast/', 
                config.darkSkyKey, 
                '/', config.lat, ',', config.lon
            ].join(''),
            params = {
                callback: 'JSON_CALLBACK',
                extend: 'hourly',
                exclude: 'alerts,flags'
            };

        $http.jsonp(url, {params: params})
            .success(function (data) {
                if (!data.minutely) {
                    console.log('DarkSky returned no minutely data, substituting hourly summary');
                    data.minutely = {
                        'summary': data.hourly.summary
                    };
                }
                callback(null, data);
            })
            .error(function (error) {
                console.log('Error getting forecast', err);
                callback(error);
            });
    }

    function currentForecast(callback) {
        if (!cachedForecast) {
            pollDarkSky(function (err, data) {
                cachedForecast = data;
                callback(null, cachedForecast);
            })
        } else {
            callback(null, cachedForecast);
        }
    }

    // poll on an interval to update forecast
    pollDarkSky(function (err, data) {
        console.log('precached forecast');
        cachedForecast = data;
    });
    $interval(function () {
        pollDarkSky(function (err, data) {
            console.log('updated forecast');
            cachedForecast = data;
        });
    }, interval);

    return {
        currentForecast: currentForecast
    };
});

app.directive('clock', function ($interval) {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            var updateClock = function () {
                    element.text(new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', timeZone: attrs.timezone}));
                }, 
                clockInterval = $interval(updateClock, 1000);

            updateClock();
            scope.$on('$destroy', function () {
                $interval.cancel(clockInterval);
            });
        }
    }
});

app.filter('temp', function ($filter) {
    return function(input, precision) {
        if (precision === undefined) {
            precision = 1;
        }
        var numberFilter = $filter('number');
        return numberFilter(input, precision) + '\u00B0';
    };
});

app.filter('percent', function ($filter) {
    return function (input, decimals) {
        return $filter('number')(input * 100, decimals) + '%';
    };
});
