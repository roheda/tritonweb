angular.module('equipoCtrl', ['equipoService', 'angularFileUpload'])
.controller('equipoController', ['$scope', '$rootScope', '$location', 'Equipo', 'Toast', '$localStorage', '$mdDialog', '$upload',
    function ($scope, $rootScope, $location, Equipo, Toast, $localStorage, $mdDialog, $upload) {

        $rootScope.seccionName = "Equipo de trabajo";

        $scope.grid   = [];
        $scope.search = "";

        $scope.getDataGrid = function (argument) {

            $scope.grid = [];

            Equipo.getEquipo().then(function successCallback(response) {
                
                for (var i = 0; i < response.data.length; i++) {                    
                    response.data[i].fecha = new Date(response.data[i].fecha);
                }

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
        
            Equipo.equipoEstatus(params.id).then(function successCallback(response) {
                Toast.show(response.data.mensaje, response.data.estatus);
                $scope.getDataGrid();
            });
        };

        $scope.deleteRegister = function (ev, params) {

            var confirm = $mdDialog.confirm()
                                    .title('¿Seguro que desea eliminar?')
                                    .ariaLabel('Confirmación')
                                    .theme('default')
                                    .targetEvent(ev)
                                    .cancel('Cancelar')
                                    .ok('Eliminar');

            $mdDialog.show(confirm).then(function() {
                
                Equipo.deleteEquipo(params.id).then(function successCallback(response) {

                    $scope.getDataGrid();
                    Toast.show(response.data.message, response.data.status);

                }, function errorCallback(error) {

                    console.log(error);
                    Toast.show('Ocurrio un error en la solicitud.','alert');
                });
            });
        };

        $scope.openPopup = function (ev) {

            $mdDialog.show({
                controller: modalController,
                templateUrl: '/administrador/partials/popups/equipo.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                locals: { 
                    data: undefined,
                    update: false
                },
            })
            .then(function(data) {
                $scope.getDataGrid();
            }, function() {});
        };

        $scope.openEditPopup = function (ev, params) {

            $mdDialog.show({
                controller: modalController,
                templateUrl: '/administrador/partials/popups/equipo.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                locals: { 
                    data: params, 
                    update: true
                },
            })
            .then(function(data) {
                $scope.getDataGrid();
            }, function() {});
        };

        $scope.getDataGrid();

        function modalController($scope, $mdDialog, data, update) {

            // Objeto de Equipo
            $scope.objectEquipo = {
                id: null,
                nombre: '', 
                descripcion: '', 
                puesto: '', 
                foto: '', 
                estatus: 1
            };

            $(".input-file").val("");

            $scope.disabled = false;
            $scope.puestos  = [];
            $scope.updating = update;
            $scope.path     = '';

            $scope.imagen = '../administrador/images/notImage.png';

            if(data != undefined) {
                
                setTimeout(function() { 
                    $scope.objectEquipo = data; 
                    $scope.imagen       = data.foto;
                }, 100);
            }

            // Función para cancelar el modal
            $scope.hide = function() {

                $mdDialog.hide();
            };

            // Función para cancelar el modal
            $scope.cancel = function() {
                $scope.destroyFiles($scope.path);
                $mdDialog.cancel();
            };

            // Función que sirve para guardar una imagen
            $scope.onFileSelect = function ($files) {

                $scope.loading = true;

                if($scope.path != '') {
                    $scope.destroyFiles($scope.path);
                    $scope.path = '';
                }

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
                            $scope.imagen  = ruta;
                            $scope.loading = false;
                        });
                    }
                    
                }, 1000);
            };

            // Función que sirve para eliminar fisicamente los archivos
            $scope.destroyFiles = function(params) {

                var obj = {
                    ruta: params
                };

                Equipo.deleteFile(obj).then(function successCallback(response) {
                    console.log();
                }, function errorCallback(error) {
                    Toast.show('Ocurrio un error en la solicitud.', 'alert');
                });
            };

            // Función que sirve para guardar un Equipo
            $scope.save = function(data) {

                var valid = true;

                if($scope.objectEquipo.nombre == '') {
                    Toast.show('Agrega un nombre', 'alert');
                    valid = false;
                }

                if($scope.objectEquipo.puesto == '') {
                    Toast.show('Agrega una puesto', 'alert');
                    valid = false;
                }

                if($scope.path == undefined && $scope.path == '') {
                    Toast.show('Agrega una fotogrfía', 'alert');
                    valid = false;
                }

                if(valid) {

                    $scope.disabled = true;
                    $scope.objectEquipo.foto = $scope.path;

                    Equipo.saveEquipo($scope.objectEquipo)
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

            // Función que sirve para editar un Equipo
            $scope.update = function() {

                var valid = true;

                if($scope.objectEquipo.nombre == '') {
                    Toast.show('Agrega un nombre', 'alert');
                    valid = false;
                }

                if($scope.objectEquipo.puesto == '') {
                    Toast.show('Agrega una puesto', 'alert');
                    valid = false;
                }

                if(valid) {

                    $scope.disabled = true;

                    if($scope.path != undefined && $scope.path != '') {

                        if($scope.objectEquipo.foto != $scope.imagen)
                            $scope.destroyFiles($scope.objectEquipo.foto);

                        $scope.objectEquipo.foto = $scope.path;
                    }

                    Equipo.updateEquipo($scope.objectEquipo.id, $scope.objectEquipo)
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


