angular.module('ngWeatherStation').controller('wrapperCtrl', ['$route', '$interval', '$location', function ($route, $interval, $location) {
	var routesArray = Object.keys($route.routes).map(function (key) {
			return obj[key];
		}),
		index = 0;
	$interval(function () {
		index = (index + 1) % routesArray.length;
		console.log('index', index);
		console.log('path', routesArray[index]);
		$location.path(routesArray[index]);
	}, 1000);
}]);