angular.module('galeriasCtrl', ['galeriasService', 'angularFileUpload'])
.controller('galeriasController', ['$scope', '$rootScope', '$location', 'Galeria', 'Toast', '$localStorage', '$mdDialog', '$upload',
    function ($scope, $rootScope, $location, Galeria, Toast, $localStorage, $mdDialog, $upload) {

        $rootScope.seccionName = "Galerias";

        $scope.grid   = [];
        $scope.search = "";

        $scope.getDataGrid = function (argument) {

            $scope.grid = [];

            Galeria.getGalerias().then(function successCallback(response) {
                
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
        
            Galeria.galeriaEstatus(params.id).then(function successCallback(response) {
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
                
                Galeria.deleteGaleria(params.id).then(function successCallback(response) {

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
                templateUrl: '/administrador/partials/popups/galeria.html',
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
                templateUrl: '/administrador/partials/popups/galeria.html',
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

            // Objeto de Galeria
            $scope.objectGaleria = {
                id: null,
                titulo: '', 
                slug: '',
                fecha: '',
                imagenes: [],
                estatus: 1
            };

            $scope.disabled = false;
            $scope.updating = update;
            $scope.files    = [];
            $scope.temp     = [];
            $scope.deleted  = [];

            if(data != undefined) {
                
                setTimeout(function() { 
                    $scope.objectGaleria = data;
                    $scope.files         = data.imagenes;
                }, 100);
            }

            // Función para cancelar el modal
            $scope.hide = function() {

                $mdDialog.hide();
            };

            // Función para cancelar el modal
            $scope.cancel = function() {
                $scope.destroyFiles($scope.temp);
                $mdDialog.cancel();
            };

            // Función que activa al seleccionar los archivos
            $scope.onFileSelect = function ($files) {

                $scope.loading = true;

                setTimeout(function () {
                    
                    if ($files.length > 10) {

                        $scope.alerts.push({
                            type: 'alert',
                            msg: 'Solo puedes seleccionar 10 archivos a la vez.'
                        });

                        return;
                    
                    } else {  

                        for (var i = 0; i < $files.length; i++) {

                            var file = $files[i];
                            var peso = (file.size / 1024) / 1024;

                            if(peso > 10.1) {
                                Toast.show('El archivo no puede pesar mas de 10 MB.','alert');
                                $('.input-file').val('');
                                return false;
                            }

                            var elem = $scope.files.find(y => y.name == file.name);

                            if(elem == null) {

                                $scope.upload = $upload.upload({
                                    method: 'POST',
                                    url: '/dashboard/uploadImagen',
                                    data: { type: 'file' },
                                    file: file,
                                })
                                .then(function (response) {

                                    var archivo = response.data.file;

                                    console.log(archivo);

                                    var obj = {
                                        idGaleria: null,
                                        descripcion: '',
                                        ruta: archivo
                                    }

                                    $scope.files.push(obj);
                                    $scope.temp.push(obj);

                                    $scope.loading = false;
                                });
                            }
                        }
                    }

                }, 1000);
            };

            // Función que sirve para eliminar fisicamente los archivos
            $scope.destroyFiles = function(params) {

                if(params.length > 0) {

                    for (var i = 0; i < params.length; i++) {

                        Galeria.deleteFile(params[i]).then(function successCallback(response) {
                        }, function errorCallback(error) {
                            Toast.show('Ocurrio un error en la solicitud.', 'alert');
                        });
                    }
                }
            };

            // Función para eliminar un Galeria de la lista
            $scope.deleteDocument = function(index, doc) {
                $scope.files.splice(index, 1);
                $scope.deleted.push(doc);
            };

            // Función que sirve para guardar un Galeria
            $scope.save = function(data) {

                var valid = true;

                $scope.fecha = new Date();

                if($scope.objectGaleria.titulo == '') {
                    Toast.show('Agrega un titulo', 'alert');
                    valid = false;
                }

                if($scope.files.length <= 0) {
                    Toast.show('Agrega por lo menos una imagen', 'alert');
                    valid = false;
                }

                if(valid) {

                    $scope.disabled = true;

                    $scope.objectGaleria.imagenes = $scope.files;
                    $scope.objectGaleria.fecha    = $scope.convertFormatDate($scope.fecha); 

                    $scope.destroyFiles($scope.deleted);

                    Galeria.saveGaleria($scope.objectGaleria).then(function successCallback(response) {

                        Toast.show(response.data.mensaje, response.data.estatus);

                        $scope.disabled = false;
                        
                        if (response.data.estatus != "alert")
                            $mdDialog.hide(response.data);

                    }, function errorCallback(error) {

                        $scope.disabled = false;
                        Toast.show("Ocurrio un error en la solicitud", "alert");
                    }); 
                }
            };

            // Función que sirve para editar un Galeria
            $scope.update = function() {

                var valid = true;

                if($scope.objectGaleria.titulo == '') {
                    Toast.show('Agrega un titulo', 'alert');
                    valid = false;
                }

                if(valid) {

                    $scope.disabled = true;
                    $scope.objectGaleria.imagenes = $scope.files;

                    $scope.destroyFiles($scope.deleted);

                    Galeria.updateGaleria($scope.objectGaleria.id, $scope.objectGaleria).then(function successCallback(response) {

                        Toast.show(response.data.mensaje, response.data.estatus);

                        $scope.disabled = false;
                        
                        if (response.data.estatus != "alert")
                            $mdDialog.hide(response.data);
                    
                    }, function errorCallback(error) {

                        $scope.disabled = false;
                        Toast.show("Ocurrio un error en la solicitud", "alert");
                    });
                }
            };

            // Función para agregar un 0 a numeros menores de 10
            function addZero(i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            };

            // Función para obtener la fecha
            $scope.convertFormatDate = function(date) {
                function pad(s) { return (s < 10) ? '0' + s : s; }
                var d = new Date(date);
                return [ d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate()) ].join('-') + " " + addZero(d.getHours()) + ":" + addZero(d.getMinutes()) + ":" + addZero(d.getSeconds());
            };
        };
    }
]);


