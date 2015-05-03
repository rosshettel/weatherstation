angular.module('ngWeatherStation').config(['$routeProvider', function ($routeProvider) {
	$routeProvider
		.when('/leftWeather', {
			templateUrl: 'static/templates/leftWeather.html',
			controller: 'weatherCtrl'
		})
		.when('/rightWeather', {
			templateUrl: 'static/templates/rightWeather.html',
			controller: 'weatherCtrl'
		});
}]);