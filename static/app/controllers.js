var app = angular.module('weatherstation');

app.controller('statusBarCtrl', function ($scope, $interval, DarkSky, config) {
    $scope.timezone = config.clock.timezone;

    DarkSky.currentForecast(function (err, data) {
        if (err) {
            $scope.forecastError = err;
        } else {
            if (data.minutely.summary.length > 60) {
                $scope.summary = data.minutely.summary.substring(0, 57) + "...";
            } else {
                $scope.summary = data.minutely.summary;
            }
            $scope.temperature = data.currently.temperature;
        }
    });
});

app.controller('todayCtrl', function ($scope, DarkSky, config) {
    function bearingToCompass(num) {
        //from https://stackoverflow.com/a/25867068
        var val = Math.floor((num / 22.5) + 0.5),
            arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        return arr[(val % 16)];
    }

    $scope.init = function () {
        DarkSky.currentForecast(function (err, data) {
            if (err) {
                $scope.forecastError = err;
            } else {
                $scope.forecast = data;
                $scope.current = {
                    icon: data.currently.icon,
                    summary: data.minutely.summary,
                    temperature: data.currently.temperature,
                    truetemperature: data.currently.apparentTemperature,
                    wind: data.currently.windSpeed + " " + data.currently.windBearing,
                    windspeed: Math.round(data.currently.windSpeed),
                    winddirection: bearingToCompass(data.currently.windBearing),
                    uvindex: data.currently.uvIndex
                };

                $scope.chartConfig = {
                    options: {
                        chart: {
                            alignTicks: false,
                            backgroundColor: 'black'

                        },
                        tooltip: {
                            enabled: true,
                            formatter: function () {
                                return new Date(this.x).toString();
                            }
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
                                    x: data.time * 1000
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
                                    y: data.precipIntensity / 25.4,
                                    x: data.time * 1000
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
                            labels: {
                                enabled: false
                            },
                            gridLineWidth: 0,
                            opposite: true
                        }
                    ],
                    xAxis: [{
                        type: 'datetime',
                        tickLength: 0,
                        labels: {
                            formatter: function () {
                                var date = new Date(this.value);
                                return date.toLocaleString('en-US', {hour: 'numeric', hour12: true});
                            },
                            style: {
                                color: "#ffffff",
                                fontSize: "14px"
                            }
                        },
                        plotLines: [{
                            color: 'white',
                            dashStyle: 'LongDash',
                            width: 1,
                            value: new Date().getTime()
                        }]
                    }]
                };
            }
        });

        $scope.clock = config.clock;
    }
});

app.controller('forecastCtrl', function ($scope, DarkSky) {
    DarkSky.currentForecast(function (err, data) {
        if (err) {
            $scope.forecastError = err;
        } else {
            $scope.dailyForecast = data.daily.data.slice(0,7);
        }

        var hourlyData = data.hourly.data,
            startTime = data.hourly.data[0].time;

        DarkSky.timeMachine(startTime, function (err, data) {
            if (err) {
                $scope.forecastError = err;
            } else {
                var beforeData = data.hourly.data.filter(function (item) {
                    return item.time < startTime;
                });
                hourlyData.unshift.apply(hourlyData, beforeData);
                hourlyData.splice(hourlyData.length - beforeData.length, beforeData.length);

                $scope.chartConfig = {
                    options: {
                        chart: {
                            alignTicks: false,
                            backgroundColor: 'black'

                        },
                        tooltip: {
                            enabled: true,
                            formatter: function () {
                                return new Date(this.x).toString();
                            }
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
                        width: 640,
                        height: 283
                    },
                    title: {
                        text: ""
                    },
                    series: [
                        {
                            name: 'Temperature',
                            animation: false,
                            data: hourlyData.map(function (data) {
                                return {
                                    y: data.temperature,
                                    x: data.time * 1000
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
                            data: hourlyData.map(function (data) {
                                return {
                                    // y: data.precipProbability * 100,
                                    y: data.precipIntensity,
                                    x: data.time * 1000
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
                            labels: {
                                enabled: false
                            },
                            tickAmount: 3,
                            gridLineWidth: 0
                        }
                    ],
                    xAxis: [{
                        type: 'datetime',
                        tickLength: 0,
                        gridLineWidth: 1,
                        labels: {
                            enabled: false
                        },
                        plotLines: [{
                            color: 'white',
                            dashStyle: 'LongDash',
                            width: 1,
                            value: new Date().getTime()
                        }]
                    }]
                };
            }
        });
    })
});

app.controller('weatherRadarCtrl', function ($scope, config) {
    $scope.imageUrl = [
        'https://api.wunderground.com/api/',
        config.wundergroundTokens[Math.floor(Math.random() * config.wundergroundTokens.length)],
        '/animatedradar/q/',
        config.zip,
        '.gif',
        '?width=640&height=460&newmaps=1&smooth=1&noclutter=1&timelabel=1&radius=45'
    ].join('');
});

app.controller('webcamCtrl', function ($scope, config) {
    $scope.imageUrl = config.webcams[Math.floor(Math.random() * config.webcams.length)];
});

app.controller('webcamDashboardCtrl', function ($scope, $interval, config) {
    var getWebcams = function () {
        $scope.webcams = config.webcams.map(function(webcam) {
            return webcam + '#' + new Date().getTime();
        });
    };
    getWebcams();
    $interval(function () {
        conosle.log('updated webcams');
        getWebcams();
    }, 1000 * 60 * 15);
});

app.controller('channelRotationCtrl', function ($scope, $route, $interval, $timeout, $location, config, DarkSky) {
    var skycons = ['clear-day', 'clear-night', 'rain', 'snow', 'sleet', 'wind', 'fog', 'cloudy', 'partly-cloudy-day', 'partly-cloudy-night'],
        index = -1,
        routesArray = config.routeRotation;

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
