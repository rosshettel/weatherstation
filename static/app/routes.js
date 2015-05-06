angular.module('ngWeatherStation').config(['$routeProvider', function ($routeProvider) {
    var weatherRadar = 'http://api.wunderground.com/api/25d29ac708c38d34/animatedradar/q/60614.gif?width=640&height=480&newmaps=1&smooth=1&noclutter=1&timelabel=1',
        noaaWebcam = 'http://www.glerl.noaa.gov/metdata/chi/chi1.jpg',
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
        .when('/leftWeather', {
            templateUrl: 'static/templates/leftWeather.html',
            controller: 'weatherCtrl'
        })
        .when('/rightWeather', {
            templateUrl: 'static/templates/rightWeather.html',
            controller: 'weatherCtrl'
        })
        .when('/weatherRadar', imageChannel(weatherRadar))
        .when('/noaaWebcam', imageChannel(noaaWebcam))
        .when('/grantParkCam', imageChannel(grantParkCam))
        .when('/loopCam', imageChannel(loopCam));
}]);