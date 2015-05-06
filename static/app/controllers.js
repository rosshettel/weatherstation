var app = angular.module('ngWeatherStation');

app.controller('weatherCtrl', ['$scope', 'ForecastIoFactory', function ($scope, ForecastIoFactory) {
    function calculateNextCommutes() {
        var now = new Date(),
            nextCommute = new Date(),
            nextNextCommute = new Date(),
            morningCommuteHour = 8,
            eveningCommuteHour = 17;

        //this should probably be tested ¯\_(ツ)_/¯
        if (now.getHours() > eveningCommuteHour) {
            nextCommute.setDate(now.getDate() + 1);
            nextCommute.setHours(morningCommuteHour, 0, 0, 0);
            nextNextCommute.setDate(now.getDate() + 1);
            nextNextCommute.setHours(eveningCommuteHour, 0, 0, 0);
        } else if (now.getHours() > morningCommuteHour) {
            nextCommute.setHours(eveningCommuteHour, 0, 0, 0);
            nextNextCommute.setDate(now.getDate() + 1);
            nextNextCommute.setHours(morningCommuteHour, 0, 0, 0);
        } else {
            nextCommute.setHours(morningCommuteHour, 0, 0, 0);
            nextNextCommute.setHours(eveningCommuteHour, 0, 0, 0);
        }

        return {
            nextCommute: nextCommute,
            nextNextCommute: nextNextCommute
        };
    }

    function findCommuteWeather(time, hourlyData) {
        var filtered = hourlyData.filter(function (hour) {
            var hourDate = new Date(hour.time * 1000);  //multiple by 1000 because forecast returns unix timestamps
            return hourDate.getTime() === time.getTime();
        });
        return filtered[0];
    }
    
    $scope.init = function () {
        var commutes = calculateNextCommutes();
        ForecastIoFactory.currentForecast(function (err, data) {
            if (err) {
                $scope.forecastError = err;
            } else {
                $scope.forecast = data;
                $scope.nextCommute = findCommuteWeather(commutes.nextCommute, $scope.forecast.hourly.data);
                $scope.nextNextCommute = findCommuteWeather(commutes.nextNextCommute, $scope.forecast.hourly.data);
            }
        });
    };
}]);

app.controller('channelRotationCtrl', ['$scope', '$route', '$interval', '$location', function ($scope, $route, $interval, $location) {
    var index = 0,
        skycons = ['clear-day', 'clear-night', 'rain', 'snow', 'sleet', 'wind', 'fog', 'cloudy', 'partly-cloudy-day', 'partly-cloudy-night'],
        routesArray = Object.keys($route.routes).reduce(function (routes, route) {
            if (route.length > 1 && route.substr(-1) !== '/') {
                routes.push(route);
            }
            return routes;
        }, []);

    $scope.initSkycon = skycons[Math.floor(Math.random() * skycons.length)];

    if ($location.search().rotate !== 'false') {
        $interval(function () {
            index = (index + 1) % routesArray.length;
            $location.path(routesArray[index]);
        }, 15000);
    }
}]);

app.controller('fullScreenImageCtrl', ['$scope', 'imageUrl', function ($scope, imageUrl) {
    $scope.imageUrl = imageUrl;
}]);