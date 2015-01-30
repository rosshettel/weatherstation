'use strict';

var app = angular.module('ngWeatherStation', ['angular-skycons']);

app.factory('ForecastIoFactory', function ($http) {
    var apiKey = 'bcb8286266a6443a96f802ac80bb4e7b',
        lat = '41.9158100',
        lon = '-87.6532760';

    return {
        currentForecast: function (callback) {
            var url = ['https://api.forecast.io/forecast/', apiKey, '/', lat, ',', lon, '?callback=JSON_CALLBACK'].join('');

            $http.jsonp(url)
                .success(function (data) {
                    callback(null, data);
                })
                .error(function (error) {
                    callback(error);
                });
        }
    };
});

app.filter('temp', function ($filter) {
    return function(input, precision) {
        if (!precision) {
            precision = 1;
        }
        var numberFilter = $filter('number');
        return numberFilter(input, precision) + '\u00B0C';
    };
});

app.filter('percent', function ($filter) {
    return function (input, decimals) {
        return $filter('number')(input * 100, decimals) + '%';
    };
});
