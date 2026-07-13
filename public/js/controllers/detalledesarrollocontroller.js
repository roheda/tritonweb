angular.module('detalleDesarrolloCtrl', ['desarrolloService', 'youtube-embed'])
.controller('detalleDesarrolloController', ['$scope', '$rootScope', '$routeParams', '$location', 'Desarrollo', '$mdDialog', '$mdToast', '$sce',
   	function($scope, $rootScope, $routeParams, $location, Desarrollo, $mdDialog, $mdToast, $sce) {

		$scope.amenidades  = [];
		$scope.detailFrame = undefined;
		$scope.playerVars  = { autoplay: 1 };

   		$scope.desarrollo = {
   			id: null,
			idEstado: null,
			estado: '',
			nombre: '',
			descripcion: '',
			brochure: '',
			imagen: '',
			logo: '',
			svg: '',
			slug: '',
			video: '',
			enlace: '',
			ubicacion: '',
			amenidades: [],
			fecha: new Date()
   		};

   		$scope.galeria = {
            id: null,
            idDesarrollo: null, 
            titulo: '', 
            slug: '',
            fecha: '',
            imagenes: [],
            estatus: 1
        };

		// Funcion para obtener el detalle de la desarrollo
		$scope.getDesarrollo = function() {
		 			
			Desarrollo.getDesarrollo($routeParams.detalle).then(function successCallback(response) {

				$('#contSVG').html("<object name='iframe1' id='iframe1' data='" +  $sce.trustAsResourceUrl(response.data.svg) + "' width='100%'></object>"); 
				// $scope.getUnidades(response.data.id);
				setTimeout(function() { $scope.getUnidades(response.data.id); }, 1000);

				$scope.desarrollo.id          = response.data.id;
				$scope.desarrollo.nombre      = response.data.nombre;
				$scope.desarrollo.slug        = response.data.slug;
				$scope.desarrollo.idEstado    = response.data.idEstado;
				$scope.desarrollo.estado      = response.data.estado;
				$scope.desarrollo.imagen      = response.data.imagen;
				$scope.desarrollo.logo        = response.data.logo;
				$scope.desarrollo.svg         = response.data.svg;
				$scope.desarrollo.enlace      = (response.data.enlace == null) ? "" : response.data.enlace;
				$scope.desarrollo.ubicacion   = response.data.ubicacion;
				$scope.desarrollo.brochure    = response.data.brochure;
				$scope.desarrollo.amenidades  = response.data.amenidades;
				$scope.desarrollo.fecha       = new Date(response.data.fecha + "T00:00:00");
				$scope.desarrollo.descripcion = $sce.trustAsHtml(response.data.descripcion);

				// $scope.addSvgAtributtes(response.data.svg);
				
				var video = response.data.video;
				
				if(video != null && video != "") {
					
					var results = video.match('[\\?&]v=([^&#]*)');
					
					console.log(results);
					
	                if(results != null)
					$scope.desarrollo.video = results[1];
				}
				
				$scope.getGaleria($scope.desarrollo.id);

            }, function errorCallback(error) { console.log(error); });
        };

        // Función que devuelve la galería existente
        $scope.getGaleria = function(param) {

        	if(param > 0) {

	            Desarrollo.getGaleria(param).then(function successCallback(response) {

	                if(response.data.id != undefined) 
	                    $scope.galeria = response.data;
	            
	            }, function errorCallback(error) {
	                Toast.show('Ocurrio un error en la solicitud.', 'alert');
	            });
        	}
        };

        // Devuelve las unidades del desarrollo
		$scope.getUnidades = function(idDesarrollo) {

			Desarrollo.getUnidades(idDesarrollo).then(function successCallback(response) { 

				$scope.unidades = response.data;
				$scope.addSvgAtributtes($scope.desarrollo.svg);

			}, function errorCallback(error) { console.log(error); });
		};

		// Función que se activa al seleccionar un desarrollo
	    $scope.addSvgAtributtes = function(svg) {

			// $scope.detailFrame = $sce.trustAsResourceUrl(svg);
			// $('#contSVG').html("<object name='iframe1' id='iframe1' data='" +  $scope.detailFrame + "' width='100%'></object>"); 

			// setTimeout(function() {

				// $("#iframe1").contents().find("g:not(:first)").mouseenter(function(){ 
				// 	$scope.hoverSvgElem($(this)); 
				// });

				$("#iframe1").contents().find("g:not(:first)").each(function(){
					$scope.addColorFunction($(this));
				});

				$("#iframe1").contents().find("g:not(:first)").click(function(){ 
					$scope.clickSvgElem(event, $(this)); 
				});

			// }, 100)

			console.log("Prueba");

			// location.reload();
	    };

	    // Función que se activa al pasar el mouse sobre una unidad
		$scope.hoverSvgElem = function(elem) {

			// elem.attr("style", "cursor: pointer;");

			var nombre = elem.attr("id");
			var unidad = $scope.unidades.find(x => x.clave == nombre);

			// if(unidad != null) {
			if(unidad != null && unidad.estatus == 2) {

				elem.attr("style", "cursor: pointer;")

				// elem.attr("style", "cursor: pointer;");

				// var uni   = "g#" + nombre + "> path";
				// var style = (unidad.estatus == 0) ? "fill: red;" : (unidad.estatus == 1) ? "fill: yellow;" : "fill: green;";

				// elem.find('path').attr("style", style);
			}

			// elem.mouseleave(function() { elem.find('path').attr("style", "fill: #fff;"); });
			elem.mouseleave(function() { elem.attr("style", "cursor: default;"); });
		};

		// Función que se activa al pasar el mouse sobre una unidad
		$scope.addColorFunction = function(elem) {

			// var nombre = elem;
			var nombre = elem.attr("id");
			var unidad = $scope.unidades.find(x => x.clave == nombre);

			if(unidad != null) {

				var uni   = "g#" + nombre + "> path";
				// var uni   = "#" + nombre + "> path";
				var style = (unidad.estatus == 0) ? "fill: red;" : (unidad.estatus == 1) ? "fill: yellow;" : "fill: green;";

				var prueba = $(nombre).find('path');

				elem.find('path').attr("style", style);
			}
		};

		// Función que se activa al seleccionar una unidad
		$scope.clickSvgElem = function(event, prueba) {

			var nombre = prueba.attr("id");
			var unidad = $scope.unidades.find(x => x.clave == nombre);

			if(unidad != null && unidad.estatus == 2)
				$scope.showUnidad(event, unidad);
		};

		// Función que abre el modal con la información de la unidad
		$scope.showUnidad = function(ev, data) {
			$mdDialog.show({
				templateUrl: '/partials/modals/unidad.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: true,
				escapeToClose: false,
				controller: unidadController,
				locals: {
					datos: data
				}
			});
		};

		// Función que abre el modal con la imagen en grande
		$scope.showImagen = function(ev, data) {

			let datos = $scope.galeria.imagenes;
			let index = $scope.galeria.imagenes.indexOf(data);

			$mdDialog.show({
				templateUrl: '/partials/modals/foto.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: true,
				disableParentScroll: true,
				escapeToClose: false,
				controller: imagenController,
				locals: {
					data: datos,
					index: index
				}
			});
		};

		// Botón para regresar
		$scope.regresar = function() {
			window.history.back();
		};

        $scope.getDesarrollo();

        /*------------------------------ Funciones Modal ------------------------------------*/

		function unidadController($scope, $mdDialog, datos) {
			$scope.unidad = datos;
		};

		function imagenController($scope, $mdDialog, data, index) {	

			$scope.index  = index;
			$scope.images = data;
		};
  	}
]) 