angular.module('ngWeatherStation').config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'static/templates/init.html'
        })
        .when('/today', {
            templateUrl: 'static/templates/today.html',
            controller: 'todayCtrl'
        })
        .when('/forecast', {
            templateUrl: 'static/templates/forecast.html',
            controller: 'forecastCtrl'
        })
        .when('/weatherRadar', {
            templateUrl: 'static/templates/fullScreenImage.html',
            controller: 'weatherRadarCtrl'
        })
        .when('/webcam', {
            templateUrl: 'static/templates/fullScreenImage.html',
            controller: 'webcamCtrl'
        });
}]);
