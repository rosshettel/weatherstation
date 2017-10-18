var app = angular.module('ngWeatherStation');

app.controller('todayCtrl', ['$scope', '$timeout', 'ForecastIoFactory', function ($scope, $timeout, ForecastIoFactory) {
    $scope.init = function () {
        //todo - use a resolve to load this before rendering https://stackoverflow.com/a/16620145
        ForecastIoFactory.currentForecast(function (err, data) {
            if (err) {
                $scope.forecastError = err;
            } else {
                $scope.forecast = data;
                $scope.current = {
                    icon: data.currently.icon,
                    summary: data.minutely.summary,
                    temperature: data.currently.temperature,
                    truetemperature: data.currently.apparentTemperature,
                    windspeed: data.currently.windSpeed,
                    winddirection: data.currently.windBearing   //todo - convert this to english
                };

                $scope.chartConfig = {
                    options: {
                        chart: {
                            alignTicks: false,
                            backgroundColor: 'black'

                        },
                        tooltip: {
                            enabled: false
                        },
                        legend: {
                            enabled: false
                        },
                        credits: {
                            enabled: false
                        }
                    },
                    loading: false,
                    size: {
                        wdith: 480,
                        height: 180
                    },
                    title: {
                        text: ""
                    },
                    series: [
                        {
                            name: 'Temperature',
                            data: data.hourly.data.map(function (data) {
                                return {
                                    y: data.temperature,
                                    x: data.time
                                };
                            }).slice(0,24),
                            type: 'spline',
                            marker: {
                                enabled: false
                            },
                            color: 'white',
                            dataLabels: {
                                enabled: true,
                                color: 'white',
                                formatter: function () {
                                    if (this.point.index % 2 == 0) {
                                        return "";
                                    } else {
                                        return Math.round(this.y) + "°";
                                    }
                                }
                            },
                            yAxis: 1
                        },
                        {
                            name: 'Precipitation',
                            data: data.hourly.data.map(function (data) {
                                return {
                                    y: data.precipProbability * 100,
                                    x: data.time
                                };
                            }).slice(0,24),
                            type: 'areaspline',
                            marker: {
                                enabled: false
                            },
                            zIndex: 2
                        },
                    ],
                    yAxis: [
                        {
                            title: {
                                text: ""
                            },
                            gridLineWidth: 0,
                            opposite: true
                        },
                        {
                            title: {
                                text: ""
                            },
                            gridLineWidth: 0,
                            labels: {
                                enabled: false
                            },
                            maxPadding: 0.05
                        }
                    ],
                    xAxis: [{
                        type: 'linear',
                        tickLength: 0,
                        labels: {
                            formatter: function () {
                                var date = new Date(this.value * 1000);
                                return date.toLocaleString('en-US', {hour: 'numeric', hour12: true});
                            }
                        }
                    }]
                };
                console.log($scope.chartConfig);
            }
        });

        function getTime() {
            return {
                chicago: (new Date()).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', timeZone: 'America/Chicago'}),
                portland: (new Date()).toLocaleString([], {hour: '2-digit', minute: '2-digit', timeZone: 'America/Los_Angeles'}),
            };
        }

        $scope.time = getTime();

        var tick = function () {
            $scope.time = getTime();
            $timeout(tick, 1000);       //todo - change this to every minute or 30 seconds
        };
        $timeout(tick, 1000);
    }
}]);

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
        routesArray = [
            '/today',
            // '/leftWeather',
            '/weatherRadar',
            // '/rightWeather',
            // '/noaaWebcam',
            // '/leftWeather',
            // '/grantParkCam',
            // '/rightWeather',
            // '/loopCam'
        ];

    $scope.initSkycon = skycons[Math.floor(Math.random() * skycons.length)];

    if ($location.search().rotate !== 'false') {
        $interval(function () {
            index = (index + 1) % routesArray.length;
            console.log('displaying', routesArray[index]);
            $location.path(routesArray[index]);
        }, 1000 * 7);
    } else {
        console.log('rotate set to false, staying on this page');
    }
}]);

app.controller('weatherRadarCtrl', ['$scope', function ($scope) {
    var getRadarUrl = function () {
        var tokens = ['d0dba01007c9d499'];
        return [
            'http://api.wunderground.com/api/',
            tokens[Math.floor(Math.random() * tokens.length)],
            '/animatedradar/q/97217.gif?width=640&height=480&newmaps=1&smooth=1&noclutter=1&timelabel=1&radius=45'
        ].join('');
    };

    $scope.imageUrl = getRadarUrl();
}]);

app.controller('fullScreenImageCtrl', ['$scope', 'imageUrl', function ($scope, imageUrl) {
    $scope.imageUrl = imageUrl;
}]);
