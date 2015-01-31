var app = angular.module('ngWeatherStation');

function calculateNextCommutes() {
    var now = new Date(),
        nextCommute = new Date(),
        nextNextCommute = new Date(),
        morningCommuteHour = 8,
        eveningCommuteHour = 17;

    //this should probably be tested ¯\_(ツ)_/¯
    if (now.getHours() > eveningCommuteHour) {
        nextCommute.setDate(now.getDate + 1);
        nextCommute.setHours(morningCommuteHour, 0, 0, 0);
        nextNextCommute.setDate(now.getDate() + 1);
        nextNextCommute.setHours(eveningCommuteHour, 0, 0, 0);
    } else if (now.getHours() > morningCommuteHour) {
        nextCommute.setHours(eveningCommuteHour, 0, 0, 0);
        nextNextCommute.setDate(now.getDate() + 1);
        nextNextCommute.setHours(morningCommuteHour, 0, 0, 0);
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
    console.log(filtered[0]);
    return filtered[0];
}

app.controller('weatherController', function ($scope, ForecastIoFactory) {
    var pollForecast = function pollForecast() {
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

    $scope.init = function () {
        pollForecast();
        setInterval(function () {
            console.log('polling weather every hour')
            pollForecast();
        }, 1000 * 60 * 60);    //poll every hour
    }
});
