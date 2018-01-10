'use strict';

var app = angular.module('ngWeatherStation', ['angular-skycons', 'ngRoute', 'highcharts-ng']);

app.constant('config', {
    webcams: [
        'http://wx.koin.com/weather/images/Eastside_Exchange.jpg',
        'http://wx.koin.com/weather/images/Riverview_Bank.jpg',
        'http://cdn.tegna-media.com/kgw/weather/wellsfargo.jpg',
        'http://cdn.tegna-media.com/kgw/weather/rosecity.jpg',
        'http://w3.gorge.net/niknas/webcam.jpg',
        'http://wx.koin.com/weather/images/Skamania_Lodge.jpg',
        'https://www.fsvisimages.com/images/photos-main/CORI1_main.jpg',
        'https://tripcheck.com/RoadCams/cams/i84metro_pid588.jpg',
        'https://tripcheck.com/RoadCams/cams/fremontbridge_pid531.jpg',
        'https://tripcheck.com/RoadCams/cams/US30%20at%20St%20Johns%20Bridge%20Top_pid3487.JPG'
    ],
    wundergroundTokens: ['d0dba01007c9d499'],
    forecastIOKey: 'bcb8286266a6443a96f802ac80bb4e7b',
    lat: '45.5751419',
    lon: '-122.7093558',
    zip: '97217',
    routeRotation: [
        {route: '/today', time: 15},
        {route: '/weatherRadar', time: 10},
        {route: '/webcam', time: 8},
        {route: '/forecast', time: 12},
        {route: '/webcam', time: 8}
    ],
    clocks: {
        top: {name: 'Chicago', tz: 'America/Chicago'},
        bottom: {name: 'Portland', tz: 'America/Los_Angeles'}
    }
});

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
                if (!data.minutely) {
                    console.log('no minutely data returned, substituting hourly summary');
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
