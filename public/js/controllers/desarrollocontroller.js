angular.module('desarrolloCtrl', ['desarrolloService'])
.controller('desarrolloController', ['$scope', '$rootScope', '$filter', '$timeout', 'Desarrollo', '$mdToast', '$sce', '$mdDialog',
	function($scope, $rootScope, $filter, $timeout, Desarrollo, $mdToast, $sce, $mdDialog) {
		
		/*------------------------- Variables, Objetos y Array-------------------------------*/

		$scope.detailFrame = null;
		$scope.desarrollos = [];
		$scope.unidades    = [];
		$scope.selectedDes = null;

		/*---------------------------- Funciones Generales-----------------------------------*/
		
		// Devuelve los elementos del desarrollos
		$scope.getDesarrollos = function() {

			Desarrollo.getDesarrollos().then(function successCallback(response) { 

				for (var i = 0; i < response.data.length; i++) {
                    
                    response.data[i].descripcion = $sce.trustAsHtml(response.data[i].descripcion);
                    response.data[i].fecha       = new Date(response.data[i].fecha + "T00:00:00");

                    $scope.desarrollos.push(response.data[i]);
                }

                if(response.data.length > 0) {

                	$scope.selectedDes  = response.data[0];
	    			$scope.detailFrame2 = $sce.trustAsResourceUrl($scope.selectedDes.svg);

	    			$scope.getUnidades(response.data[0].id);
                }
                
			}, function errorCallback(error) { console.log(error); });
	    };

		// Devuelve las unidades del desarrollo
		$scope.getUnidades = function(idDesarrollo) {

			Desarrollo.getUnidades(idDesarrollo).then(function successCallback(response) { 

				$scope.unidades = response.data;

			}, function errorCallback(error) { console.log(error); });
		};

	    // Función que se activa al seleccionar un desarrollo
	    $scope.selectDesarrollo = function(desarrollo) {

	    	//console.log(desarrollo);

			$scope.getUnidades(desarrollo.id);

			$scope.selectedDes  = desarrollo;
			// $scope.detailFrame2 = $sce.trustAsResourceUrl($scope.selectedDes.svg);

			// setTimeout(function() {

			// 	$("#iframe1").contents().find("g:not(:first)").mouseenter(function(){ 
			// 		$scope.hoverSvgElem($(this)); 
			// 	});

			// 	$("#iframe1").contents().find("g:not(:first)").click(function(){ 
			// 		$scope.clickSvgElem(event, $(this)); 
			// 	});

			// }, 1000)
	    };

	    // Función que se activa al pasar el mouse sobre una unidad
		// $scope.hoverSvgElem = function(prueba) {

		// 	prueba.attr("style", "cursor: pointer;");

		// 	var nombre = prueba.attr("id");
		// 	var unidad = $scope.unidades.find(x => x.clave == nombre);

		// 	if(unidad != null) {

		// 		//console.log(unidad);

		// 		var uni   = "g#" + nombre + "> path";
		// 		var style = (unidad.estatus == 0) ? "fill: red;" : (unidad.estatus == 1) ? "fill: yellow;" : "fill: green;";

		// 		prueba.find('path').attr("style", style);
		// 	}

		// 	prueba.mouseleave(function() { prueba.find('path').attr("style", "fill: #fff;"); });
		// };

		// // Función que se activa al seleccionar una unidad
		// $scope.clickSvgElem = function(event, prueba) {

		// 	var nombre = prueba.attr("id");
		// 	var unidad = $scope.unidades.find(x => x.clave == nombre);

		// 	if(unidad != null) {

		// 		console.log(unidad);
		// 		//alert("Detalle unidad " + nombre);

		// 		$scope.showUnidad(event, unidad);
		// 	}
		// };

		// // Función que abre el modal con la información de la unidad
		// $scope.showUnidad = function(ev, data) {
		//     $mdDialog.show({
		//       	templateUrl: '/partials/modals/unidad.html',
		//      	parent: angular.element(document.body),
  // 				targetEvent: ev,
  // 				clickOutsideToClose: true,
		// 		escapeToClose: false,
  // 				controller: unidadController,
  // 				locals: {
  // 					datos: data
  // 				}
  // 			});
		// };

		$scope.getDesarrollos();

		/*------------------------------ Funciones Modal ------------------------------------*/

		// function unidadController($scope, $mdDialog, datos) {

		// 	console.log(datos);
			
		// 	$scope.unidad = datos;
		// };
	}
]);