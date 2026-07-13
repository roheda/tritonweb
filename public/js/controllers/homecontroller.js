angular.module('homeCtrl', ['homeService'])
.controller('homeController', ['$scope', '$rootScope', '$filter', '$timeout', 'Home', '$mdToast', '$sce',
	function($scope, $rootScope, $filter, $timeout, Home, $mdToast, $sce) {
		
		/*------------------------- Variables, Objetos y Array-------------------------------*/

		$scope.slider = [];
		$scope.equipo = [];

		$scope.objForm = {
			nombre: '',
			puesto: '',
			tipoPersona: 0,
			territorio: '',
			cac: '',
			correo: '',
			telefono: '',
			mensaje : ''
		};

		/*---------------------------- Funciones Generales-----------------------------------*/
		
		// Devuelve los elementos del slider
		$scope.getSlider = function() {

			Home.getSlider().then(function successCallback(response) { 
				$scope.slider = response.data; 
			}, function errorCallback(error) { console.log(error); });
		};

	    // Devuelve los elementos del slider
        $scope.getTeam = function() {

            Home.getTeam().then(function successCallback(response) {

            	for (var i = 0; i < response.data.length; i++) {
                    
                    response.data[i].descripcion = $sce.trustAsHtml(response.data[i].descripcion);
                    response.data[i].fecha       = new Date(response.data[i].fecha + "T00:00:00");

                    $scope.equipo.push(response.data[i]);
                }

            }, function errorCallback(error) { console.log(error); });
        };

	    $scope.getSlider();
	    $scope.getTeam();
	}
])

.filter('limitHtml', function($sce) {
    return function(text, limit) {

        var changedString = String(text).replace(/<[^>]+>/gm, '');

		var length   = changedString.length;
		var response = changedString.length > limit ? changedString.substr(0, limit - 1) + "..." : changedString + "...";

        return $sce.trustAsHtml(response); 
    }
});