'use strict';

Highcharts.setOptions({
    global: {
        useUTC: false
    }
});

var app = angular.module('weatherstation', ['angular-skycons', 'ngRoute', 'highcharts-ng']);

app.factory('DarkSky', function ($http, $interval, config) {
    var interval = 1000 * 60 * 5,  //5 minutes, we get 1000 free calls a day
        cachedForecast;

    function pollDarkSky(params, callback) {
        var url = [
                'https://api.darksky.net/forecast/', 
                config.darkSkyKey, 
                '/', config.lat, ',', config.lon
            ].join(''),
            requestParams = {
                callback: 'JSON_CALLBACK'
            };

        if (params.time) {
            url += "," + params.time;
        }
        if (params.extend) {
            requestParams['extend'] = params.extend;
        }
        if (params.exclude) {
            requestParams['exclude'] = params.exclude;
        }

        $http.jsonp(url, {params: requestParams})
            .success(function (data) {
                callback(null, data);
            })
            .error(function (error) {
                console.log('Error getting polling DarkSky', err);
                callback(error);
            });
    }

    function currentForecast(callback) {
        if (!cachedForecast) {
            pollDarkSky({
                'extend': 'hourly',
                'exclude': 'alerts,flags'
            }, function (err, data) {
                if (!data.minutely) {
                    console.log('DarkSky returned no minutely data, substituting hourly summary');
                    data.minutely = {
                        'summary': data.hourly.summary
                    };
                }
                cachedForecast = data;
                callback(null, cachedForecast);
            })
        } else {
            callback(null, cachedForecast);
        }
    }

    function timeMachine(time, callback) {
        pollDarkSky({
            'time': time,
            'extend': 'hourly',
            'exclude': 'currently,minutely,daily,alerts,flags'
        }, function (err, data) {
            callback(null, data);
        });
    }

    // poll on an interval to update forecast
    currentForecast(function () {
        console.log('precached forecast');
    });
    $interval(function () {
        currentForecast(function () {
            console.log('updated forecast');
        });
    }, interval);

    return {
        currentForecast: currentForecast,
        timeMachine: timeMachine
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
