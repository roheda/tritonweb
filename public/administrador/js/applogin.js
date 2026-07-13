angular.module('login', ['ngMaterial'])
.config( function($mdThemingProvider) {

	$mdThemingProvider.theme('default')
	.primaryPalette('green', {
		'default': '700',
		'hue-1': '100',
		'hue-2': '600',
		'hue-3': 'A100'
	});
})

.controller('loginCtrl', function($scope) {

	$scope.isChecked = null;

	$scope.setrecordar = function () {

		if ($scope.isChecked)
			document.getElementById("checkboxRecordarCredenciales").checked = true;
		
		else
			document.getElementById("checkboxRecordarCredenciales").checked = false;
	}	
})

.directive('resize', function($window) {
	return {
		restrict: 'A',
		scope: {
			data: '@',
		},
		link: function (scope, elem, attrs) {
			
			function resize () {

				var winHeight = $window.innerHeight;
				
				if($window.innerWidth >= 960)
					elem.css({ 'height': winHeight + 'px' });

				else if($window.innerWidth < 960)
					elem.css({ 'height': 'auto'});
			} 

			resize();

			angular.element($window).bind('resize', function() {
				resize();
			})
		}
	};
});
