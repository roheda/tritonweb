angular.module('sliderCtrl', ['sliderService', 'angularFileUpload'])
.controller('sliderController', ['$scope', '$rootScope', '$upload', '$location', 'Slide', 'Toast', '$localStorage', '$mdDialog',
	function ($scope, $rootScope, $upload, $location, Slide, Toast, $localStorage, $mdDialog) {

		$rootScope.seccionName = "Slider";

		$scope.grid   = [];
		$scope.search = "";

		$scope.getSlider = function (argument) {

			$scope.grid = [];

			Slide.getSlides().then(function successCallback(response) {

				$scope.grid = response.data;

			}, function errorCallback(error) {

				Toast.show("Ocurrio un error en la solicitud", "alert");
			});
		};

		$scope.ordenar = function(params) {
            $scope.orden = !$scope.orden;
            $scope.campo = params;
        };

		$scope.changeStatus = function (params) {
		
			Slide.slideEstatus(params.id).then(function successCallback(response) {

				Toast.show(response.data.mensaje, response.data.estatus);
				$scope.getSlider();
			});
		};

		$scope.deleteSlider = function (ev, params) {

			var confirm = $mdDialog.confirm()
									.title('¿Seguro que desea eliminar?')
									.ariaLabel('Confirmación')
									.theme('default')
									.targetEvent(ev)
									.cancel('Cancelar')
									.ok('Eliminar');

			$mdDialog.show(confirm).then(function() {
				
				Slide.deleteSlide(params.id).then(function successCallback(response) {

					$scope.getSlider();
					Toast.show(response.data.mensaje, response.data.estatus);

				}, function errorCallback(error) {

					console.log(data);
					Toast.show('Ocurrio un error en la solicitud.','alert');
				});

			});
		};

		$scope.openPopup = function (ev) {

            $mdDialog.show({
                controller: modalController,
                templateUrl: '/administrador/partials/popups/slide.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                locals: { 
                	data: undefined,
                	update: false
                },
            })
            .then(function(data) {
				$scope.getSlider();
			}, function() {});
        };

        $scope.openEditPopup = function (ev, params) {

            $mdDialog.show({
                controller: modalController,
                templateUrl: '/administrador/partials/popups/slide.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                locals: { 
                	data: params, 
                	update: true
                },
            })
            .then(function(data) { $scope.getSlider(); }, function() {});
        };

        $scope.getSlider();

        function modalController($scope, $mdDialog, data, update) {

        	// Objeto de slider
        	$scope.objectSlide = {
				id: null,
				titulo: '', 
				descripcion: '', 
				enlace: '', 
				foto: '', 
				estatus: 1
			};

			$(".input-file").val("");

			$scope.disabled = false;
			$scope.updating = update;

			$scope.imagen = '../administrador/images/notImage.png';

			if(data != undefined) {
				
				setTimeout(function() { 

					$scope.objectSlide = data; 
					$scope.imagen      = data.foto;

				}, 100);
			}

			// Función para cancelar el modal
        	$scope.hide = function() {

				$mdDialog.hide();
			};

			// Función para cancelar el modal
			$scope.cancel = function() {

				$mdDialog.cancel();
			};

			// Función que sirve para guardar una imagen
			$scope.onFileSelect = function ($files) {

                $scope.loading = true;

                setTimeout(function () {

                    if ($files.length > 1) {

                        $scope.alerts.push({
                            type: 'alert',
                            msg: 'Solo puedes seleccionar un archivo'
                        });
                        $scope.loading = false;
                        return;

                    } else {

                    	$scope.file = $files[0];

	                    $scope.upload = $upload.upload({
		                    method: 'POST',
		                    url: '/dashboard/uploadImagen',
		                    data: {
		                        type: 'file'
		                    },
		                    file: $scope.file,
		                });

		                $scope.upload.then(function (response) {	                        

	                        var ruta = response.data.file;

							$scope.path    = ruta;
							$scope.imagen  = "../../../" + ruta;
							$scope.loading = false;
	                    });
                    }
                    
                }, 1000);
            };

            // Función que sirve para guardar un slide
			$scope.save = function(data) {

				var valid = true;

				if($scope.objectSlide.titulo == '') {
					Toast.show('Agrega un titulo', 'alert');
					valid = false;
				}

				if($scope.path == undefined && $scope.path == '') {
					Toast.show('Agrega una fotogrfía', 'alert');
					valid = false;
				}

				if(valid) {

					$scope.disabled = true;
					$scope.objectSlide.foto = $scope.path;

					Slide.newSlide($scope.objectSlide)
					.then(function successCallback(response) {

						Toast.show(response.data.mensaje, response.data.estatus);

						$scope.disabled = false;
						
						if (response.data.estatus != "alert")
							$mdDialog.hide(data);

					}, function errorCallback(error) {
						$scope.disabled = false;
						Toast.show("Ocurrio un error en la solicitud", "alert");
					});	
				}
			};

			// Función que sirve para editar un slide
			$scope.update = function() {

				var valid = true;

				if($scope.objectSlide.titulo == '') {
					Toast.show('Agrega un titulo', 'alert');
					valid = false;
				}

				if(valid) {

					$scope.disabled = true;

					if($scope.path != undefined && $scope.path != '')
						$scope.objectSlide.foto = $scope.path;

					Slide.updateSlide($scope.objectSlide.id, $scope.objectSlide)
					.then(function successCallback(response) {

						Toast.show(response.data.mensaje, response.data.estatus);

						$scope.disabled = false;
						
						if (response.data.estatus != "alert")
							$mdDialog.hide(data);

					}, function errorCallback(error) {

						$scope.disabled = false;
						Toast.show("Ocurrio un error en la solicitud", "alert");
					});
				}
			};
        };
	}
]);


