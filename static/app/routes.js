angular.module('ngWeatherStation').config(['$routeProvider', function ($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'templates/init.html'
		})
		.when('/leftWeather', {
			templateUrl: 'templates/leftWeather.html',
			controller: 'weatherCtrl'
		})
		.when('/rightWeather', {
			templateUrl: 'templates/rightWeather.html',
			controller: 'weatherCtrl'
		});
}]);