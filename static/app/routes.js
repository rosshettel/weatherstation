angular.module('ngWeatherStation').config(['$routeProvider', function ($routeProvider) {
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
	    .when('/weatherRadar', {
		   templateUrl: 'static/templates/fullScreenImage.html',
             controller: 'fullScreenImageCtrl',
             resolve: {
                 imageUrl: function () { return 'http://api.wunderground.com/api/25d29ac708c38d34/animatedradar/q/60614.gif?width=620&height=460&newmaps=1&smooth=1&noclutter=1&timelabel=1'; }
             }
	    });
}]);