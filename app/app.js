'use strict';

var app = angular.module('ngWeatherStation', ['angular-skycons']);

app.filter('temp', function ($filter) {
    return function(input, precision) {
        if (!precision) {
            precision = 1;
        }
        var numberFilter = $filter('number');
        return numberFilter(input, precision) + '\u00B0C';
    };
});

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

app.controller('weatherController', function ($scope, ForecastIoFactory) {
    var morningCommute = new Date().setHours(8, 0, 0, 0),
        eveningCommute = new Date().setHours(17, 0 ,0 ,0),
        pollForecast = function pollForecast() {
            ForecastIoFactory.currentForecast(function (err, data) {
                if (err) {
                    $scope.forecastError = err;
                } else {
                    console.log(data);
                    $scope.forecast = data;
                    //loop through hourly and find commute times
                }
            });
        };

    console.log(morningCommute);
    console.log(eveningCommute);

    $scope.init = function () {
        pollForecast();
        setInterval(function () {
            console.log('polling weather every hour')
            pollForecast();
        }, 1000 * 60 * 60);    //poll every hour
    }



});
