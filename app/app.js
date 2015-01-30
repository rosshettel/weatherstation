'use strict';

var app = angular.module('ngWeatherStation', []);

app.factory('ForecastIoFactory', function ($http) {
    var apiKey = 'bcb8286266a6443a96f802ac80bb4e7b',
        lat = '41.9158100',
        lon = '87.6532760';

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
    ForecastIoFactory.currentForecast(function (err, data) {
        $scope.forecast = data;
    });
});
