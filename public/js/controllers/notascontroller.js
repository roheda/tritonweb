angular.module('notasCtrl', ['notasService'])
.controller('notasController', ['$scope', '$rootScope', '$routeParams', '$location', 'Nota', '$mdDialog', '$mdToast', '$sce',
   	function($scope, $rootScope, $routeParams, $location, Nota, $mdDialog, $mdToast, $sce) {

   		$scope.nota = {
   			titulo: '',
   			slug: '',
   			descripcion: '',
			categoria: '',
   			foto: '',
   			fecha: ''
   		};

		// Funcion para obtener el nota de la nota
		$scope.getNota = function() {
		 			
			Nota.getNota($routeParams.nota).then(function successCallback(response) { 

				$scope.nota.titulo      = response.data.titulo;
				$scope.nota.slug        = response.data.slug;
				$scope.nota.foto        = response.data.foto;
				$scope.nota.categoria   = response.data.categoria;
				$scope.nota.descripcion = $sce.trustAsHtml(response.data.descripcion);
				$scope.nota.fecha       = new Date(response.data.fecha + "T00:00:00");

            }, function errorCallback(error) { console.log(error); });
        };

		// Botón para regresar
		$scope.regresar = function() {
			window.history.back();
		};

        $scope.getNota();
  	}
]) 