var app = angular.module('ngWeatherStation');

app.controller('todayCtrl', function ($scope, $timeout, ForecastIO) {
    $scope.init = function () {
        ForecastIO.currentForecast(function (err, data) {
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
                            animation: false,
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
                            zIndex: 1
                        },
                        {
                            name: 'Precipitation',
                            animation: false,
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
                            yAxis: 1
                        },
                    ],
                    yAxis: [
                        {
                            title: {
                                text: ""
                            },
                            gridLineWidth: 0,
                            labels: {
                                enabled: false
                            }
                        },
                        {
                            title: {
                                text: ""
                            },
                            gridLineWidth: 0,
                            opposite: true,
                            min: 0,
                            max: 100
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
            $timeout(tick, 1000);
        };
        $timeout(tick, 1000);
    }
});

app.controller('forecastCtrl', function ($scope, ForecastIO) {
    ForecastIO.currentForecast(function (err, data) {
        if (err) {
            $scope.forecastError = err;
        } else {
            $scope.dailyForecast = data.daily.data.slice(0,7);
        }

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
                height: 325
            },
            title: {
                text: ""
            },
            series: [
                {
                    name: 'Temperature',
                    animation: false,
                    data: data.hourly.data.map(function (data) {
                        return {
                            y: data.temperature,
                            x: data.time
                        };
                    }),
                    type: 'spline',
                    marker: {
                        enabled: false
                    },
                    color: 'white',
                    dataLabels: {
                        enabled: true,
                        color: 'white',
                        allowOverlap: true,
                        formatter: function () {
                            var splits = [0,23,47,71,95,119,143,168],
                                subset;

                            for (var i = 0; i < splits.length; i++) {
                                if (this.point.index <= splits[i + 1] && this.point.index >= splits[i]) {
                                    subset = this.series.data.slice(splits[i], splits[i + 1]).map(function (data) {
                                        return data.y;
                                    });
                                    break;
                                }
                            }

                            var max = Math.max.apply(null, subset),
                                min = Math.min.apply(null, subset),
                                point = this.point.y;

                            if (this.point.y == min || this.point.y == max) {
                                return Math.round(this.point.y) + "°";
                            } else {
                                return "";
                            }
                        }
                    },
                    zIndex: 1
                },
                {
                    name: 'Precipitation',
                    animation: false,
                    data: data.hourly.data.map(function (data) {
                        return {
                            y: data.precipProbability * 100,
                            x: data.time
                        };
                    }),
                    type: 'areaspline',
                    marker: {
                        enabled: false
                    },
                    yAxis: 1
                },
            ],
            yAxis: [
                {
                    title: {
                        text: ""
                    },
                    gridLineWidth: 0,
                    labels: {
                        enabled: false
                    }
                },
                {
                    title: {
                        text: ""
                    },
                    tickAmount: 3,                    
                    gridLineWidth: 0,
                    opposite: true,
                    min: 0,
                    max: 100
                }                
            ],
            xAxis: [{
                type: 'linear',
                tickLength: 0,
                gridLineWidth: 1,
                labels: {
                    enabled: false
                }
            }]
        };
    })
});

app.controller('weatherRadarCtrl', function ($scope) {
    var getRadarUrl = function () {
        var tokens = ['d0dba01007c9d499'];
        return [
            'http://api.wunderground.com/api/',
            tokens[Math.floor(Math.random() * tokens.length)],
            '/animatedradar/q/97217.gif?width=640&height=480&newmaps=1&smooth=1&noclutter=1&timelabel=1&radius=45'
        ].join('');
    };

    $scope.imageUrl = getRadarUrl();
});

app.controller('webcamCtrl', function ($scope) {
    var cams = [
        'http://wx.koin.com/weather/images/Eastside_Exchange.jpg',
        'http://wx.koin.com/weather/images/Riverview_Bank.jpg',
        // 'http://cdn.tegna-media.com/kgw/weather/wellsfargo.jpg',
        'http://wx.koin.com/weather/images/Skamania_Lodge.jpg',
        'https://www.fsvisimages.com/images/photos-main/CORI1_main.jpg',
        'https://tripcheck.com/RoadCams/cams/i84metro_pid588.jpg',
        'https://tripcheck.com/RoadCams/cams/fremontbridge_pid531.jpg',
        'https://tripcheck.com/RoadCams/cams/US30%20at%20St%20Johns%20Bridge%20Top_pid3487.JPG'
    ];

    $scope.imageUrl = cams[Math.floor(Math.random() * cams.length)];
});

app.controller('channelRotationCtrl', function ($scope, $route, $interval, $timeout, $location, ForecastIO) {
    var skycons = ['clear-day', 'clear-night', 'rain', 'snow', 'sleet', 'wind', 'fog', 'cloudy', 'partly-cloudy-day', 'partly-cloudy-night'],
        index = -1,
        routesArray = [
            {route: '/today', time: 15},
            {route: '/weatherRadar', time: 8},
            {route: '/webcam', time: 5},
            {route: '/forecast', time: 10},
            {route: '/webcam', time: 4}
        ];

    $scope.initSkycon = skycons[Math.floor(Math.random() * skycons.length)];

    if ($location.search().rotate !== 'false') {
        var loop = function () {
            index = (index + 1) % routesArray.length;
            console.log('displaying ' + routesArray[index].route + ' for ' + routesArray[index].time + ' seconds');
            $location.path(routesArray[index].route);
            $timeout(loop, 1000 * routesArray[index].time);
        }
        $timeout(loop, 1000 * 5);
    } else {
        console.log('rotate set to false, staying on this page');
    }
});
