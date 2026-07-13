angular.module('inversionCtrl', ['homeService'])
.controller('inversionController', ['$scope', '$rootScope', '$filter', '$timeout', 'Home', '$mdToast', '$sce',
	function($scope, $rootScope, $filter, $timeout, Home, $mdToast, $sce) {
		
		$scope.slider = [];

		// Devuelve los elementos del slider
		$scope.getSlider = function() {

			Home.getSlider().then(function successCallback(response) { 
				$scope.slider = response.data; 
			}, function errorCallback(error) { console.log(error); });
		};

		$scope.getSlider();
	}
])