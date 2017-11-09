'use strict';

var app = angular.module('ngWeatherStation', ['angular-skycons', 'ngRoute', 'highcharts-ng']);

app.factory('ForecastIO', function ($http, $interval, config) {
    var interval = 1000 * 60 * 5,  //5 minutes, we get 1000 free calls a day
        cachedForecast;

    function pollForecastIO(callback) {
        var url = [
                'https://api.darksky.net/forecast/', 
                config.forecastIOKey, 
                '/', config.lat, ',', config.lon, 
                // '?callback=JSON_CALLBACK'
            ].join(''),
            params = {
                callback: 'JSON_CALLBACK',
                extend: 'hourly',
                exclude: 'alerts,flags'
            };

        $http.jsonp(url, {params: params})
            .success(function (data) {
                callback(null, data);
            })
            .error(function (error) {
                console.log('Error getting forecast', err);
                callback(error);
            });
    }

    function currentForecast(callback) {
        if (!cachedForecast) {
            pollForecastIO(function (err, data) {
                cachedForecast = data;
                callback(null, cachedForecast);
            })
        } else {
            callback(null, cachedForecast);
        }
    }

    // poll on an interval to update forecast
    pollForecastIO(function (err, data) {
        console.log('precached forecast');
        cachedForecast = data;
    });
    $interval(function () {
        pollForecastIO(function (err, data) {
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
