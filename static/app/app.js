'use strict';

var app = angular.module('ngWeatherStation', ['angular-skycons', 'ngRoute', 'highcharts-ng']);

app.factory('ForecastIO', function ($http, $interval) {
    var apiKey = 'bcb8286266a6443a96f802ac80bb4e7b',
        lat = '45.5751419',
        lon = '-122.7093558',
        interval = 1000 * 60 * 5,  //5 minutes, we get 1000 free calls a day
        cachedForecast;

    function pollForecastIO(callback) {
        var url = ['https://api.darksky.net/forecast/', apiKey, '/', lat, ',', lon, '?callback=JSON_CALLBACK'].join(''),
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
