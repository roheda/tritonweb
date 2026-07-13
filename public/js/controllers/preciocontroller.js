angular.module('precioCtrl', ['multimediaService'])
.controller('precioController', ['$scope', '$animate', 'Multimedia', '$mdToast',
	function($scope, $animate, Multimedia, $mdToast) {
		
		// $scope.images = [
		// 	{
		// 		id: 0,
		// 		ruta: '../img/galeria/images/1.png',
		// 		titulo: 'prueba',
		// 		descripcion: 'prueba'
		// 	},
		// 	{
		// 		id: 1,
		// 		ruta: '../img/galeria/images/2.png',
		// 		titulo: 'prueba',
		// 		descripcion: 'prueba'
		// 	},
		// 	{
		// 		id: 2,
		// 		ruta: '../img/galeria/images/3.png',
		// 		titulo: 'prueba',
		// 		descripcion: 'prueba'
		// 	},
		// 	{
		// 		id: 3,
		// 		ruta: '../img/galeria/images/3.png',
		// 		titulo: 'prueba',
		// 		descripcion: 'prueba'
		// 	},
		// 	{
		// 		id: 4,
		// 		ruta: '../img/galeria/images/1.png',
		// 		titulo: 'prueba',
		// 		descripcion: 'prueba'
		// 	},
		// 	{
		// 		id: 5,
		// 		ruta: '../img/galeria/images/2.png',
		// 		titulo: 'prueba',
		// 		descripcion: 'prueba'
		// 	},
		// 	{
		// 		id: 6,
		// 		ruta: '../img/galeria/images/2.png',
		// 		titulo: 'prueba',
		// 		descripcion: 'prueba'
		// 	},
		// 	{
		// 		id: 7,
		// 		ruta: '../img/galeria/images/1.png',
		// 		titulo: 'prueba',
		// 		descripcion: 'prueba'
		// 	},
		// 	{
		// 		id: 8,
		// 		ruta: '../img/galeria/images/3.png',
		// 		titulo: 'prueba',
		// 		descripcion: 'prueba'
		// 	}
		// ];
		
		$scope.images   = [];
		$scope.galerias = [];
		$scope.videos   = [];

		$scope.getGalerias = function() {

			Multimedia.getGalerias().then(function successCallback(response) {

				$scope.galerias = response.data;

				// if($scope.galerias.length > 0)
				// 	$scope.images = $scope.galerias[0].imagenes;

			}, function errorCallback(error) { console.log(error); });
		};

		$scope.getGalerias();		

	}
])