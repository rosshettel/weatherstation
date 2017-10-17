angular.module('ngWeatherStation').config(['$routeProvider', function ($routeProvider) {
    
    var noaaWebcam = 'http://www.glerl.noaa.gov/metdata/chi/chi1.jpg',
        grantParkCam = 'http://cdn.abclocal.go.com/three/wls/webcam/ColumbiaCam.jpg',
        loopCam = 'http://cdn.abclocal.go.com/three/wls/webcam/Loopscape.jpg',
        imageChannel = function (imgSrc) {
            return {
                templateUrl: 'static/templates/fullScreenImage.html',
                controller: 'fullScreenImageCtrl',
                resolve: {
                    imageUrl: function () { return imgSrc; }
                }
            };
        };
        
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
        .when('/noaaWebcam', imageChannel(noaaWebcam))
        .when('/grantParkCam', imageChannel(grantParkCam))
        .when('/loopCam', imageChannel(loopCam));
}]);
