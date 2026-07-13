angular.module('desarrollosCtrl', ['desarrollosService', 'galeriasService', 'angularFileUpload'])
.controller('desarrollosController', ['$scope', '$rootScope', '$location', 'Desarrollo', 'Galeria', 'Toast', '$localStorage', '$mdDialog', '$upload',
    function ($scope, $rootScope, $location, Desarrollo, Galeria, Toast, $localStorage, $mdDialog, $upload) {

        $rootScope.seccionName = "Desarrollos";

        $scope.grid   = [];
        $scope.search = "";

        $scope.getDataGrid = function (argument) {

            $scope.grid = [];

            Desarrollo.getDesarrollos().then(function successCallback(response) {
                
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
        
            Desarrollo.galeriaEstatus(params.id).then(function successCallback(response) {
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
                
                Desarrollo.deleteDesarrollo(params.id).then(function successCallback(response) {

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
                templateUrl: '/administrador/partials/popups/desarrollo.html',
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

        $scope.openGalleryPopup = function (ev, param) {

            $mdDialog.show({
                controller: modalGalleryController,
                templateUrl: '/administrador/partials/popups/galeria.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                locals: { 
                    idDesarrollo: param
                },
            })
            .then(function(data) {}, function() {});
        };

        $scope.openEditPopup = function (ev, params) {

            $mdDialog.show({
                controller: modalController,
                templateUrl: '/administrador/partials/popups/desarrollo.html',
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

            // Objeto de Desarrollo
            $scope.objectDesarrollo = {
                id: null,
                idEstado: 31,
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
                fecha: new Date(),
                estatus: 1
            };

            $(".input-file").val("");

            $scope.loadingBrochure = false;

            $scope.disabled = false;
            $scope.updating = update;
            $scope.estados  = [];
            $scope.path     = '';
            $scope.path2    = '';
            $scope.path3    = '';
            $scope.pdf      = '';

            $scope.files    = [];
            $scope.temp     = [];
            $scope.deleted  = [];

            $scope.imagen  = '../administrador/images/notImage.png';
            $scope.imagen2 = '../administrador/images/notImage.png';
            $scope.imagen3 = '../administrador/images/notImage.png';
            $scope.ruta    = '';

            if(data != undefined) {
                
                setTimeout(function() { 

                    $scope.objectDesarrollo = data; 

                    $scope.imagen  = data.imagen;
                    $scope.imagen2 = data.logo;
                    $scope.imagen3 = data.svg;
                    $scope.files   = data.amenidades;
                    
                }, 100);
            }

            // Función para cancelar el modal
            $scope.hide = function() {

                $mdDialog.hide();
            };

            // Función para cancelar el modal
            $scope.cancel = function() {

                $scope.destroyFiles($scope.path);
                $scope.destroyFiles($scope.path2);

                $mdDialog.cancel();
            };

            // Función que devuelve la galería existente
            $scope.getEstados = function(param) {

                Desarrollo.getEstados(param).then(function successCallback(response) {
                    $scope.estados = response.data;
                }, function errorCallback(error) {
                    Toast.show('Ocurrio un error en la solicitud.', 'alert');
                });
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

            // Función que sirve para guardar una imagen
            $scope.onFileSelect2 = function ($files) {

                if($scope.path2 != '') {
                    $scope.destroyFiles($scope.path2);
                    $scope.path2 = '';
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

                        $scope.file2 = $files[0];

                        $scope.upload = $upload.upload({
                            method: 'POST',
                            url: '/dashboard/uploadImagen',
                            data: {
                                type: 'file'
                            },
                            file: $scope.file2,
                        });

                        $scope.upload.then(function (response) {                            

                            var ruta = response.data.file;

                            $scope.path2    = ruta;
                            $scope.imagen2  = ruta;
                            $scope.loading  = false;
                        });
                    }
                    
                }, 1000);
            };

            // Función que sirve para guardar una imagen
            $scope.onFileSelect3 = function ($files) {

                $scope.loading = true;

                if($scope.path3 != '') {
                    $scope.destroyFiles($scope.path3);
                    $scope.path3 = '';
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

                        $scope.file3 = $files[0];

                        if($scope.file3.type = "image/svg+xml") {

                            console.log($scope.file3);

                            $scope.upload = $upload.upload({
                                method: 'POST',
                                url: '/dashboard/uploadFile',
                                data: {
                                    type: 'file'
                                },
                                file: $scope.file3,
                            });

                            $scope.upload.then(function (response) {                            

                                var ruta = response.data.file;

                                console.log(ruta);

                                $scope.path3    = ruta.ruta;
                                $scope.imagen3  = ruta.ruta;
                                $scope.loading  = false;
                            });

                        } else {

                            $scope.alerts.push({
                                type: 'alert',
                                msg: 'El archivo debe de estar en formato .svg'
                            });
                            $scope.loading = false;
                            return;

                        }
                    }
                    
                }, 1000);
            };

            // Función que sirve para guardar un archivo
            $scope.onFilePDFSelect = function ($files) {

                $scope.loadingBrochure = true;

                if($scope.pdf != '') {
                    $scope.destroyFiles($scope.pdf);
                    $scope.pdf = '';
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
                            url: '/dashboard/uploadFile',
                            data: {
                                type: 'file'
                            },
                            file: $scope.file,
                        });

                        $scope.upload.then(function (response) {                            

                            var ruta = response.data.file;

                            $scope.pdf     = ruta.ruta;
                            $scope.ruta    = ruta.ruta;

                            $scope.loadingBrochure = false;
                        });
                    }
                    
                }, 1000);
            };

            // Función que sirve para eliminar fisicamente los archivos
            $scope.destroyFiles = function(params) {

                var obj = {
                    ruta: params
                };

                Desarrollo.deleteFile(obj).then(function successCallback(response) {
                    console.log();
                }, function errorCallback(error) {
                    Toast.show('Ocurrio un error en la solicitud.', 'alert');
                });
            };

            // Función que activa al seleccionar los archivos
            $scope.onListFileSelect = function ($files) {

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
                                        idDesarrollo: null,
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
            $scope.destroyListFiles = function(params) {

                if(params.length > 0) {

                    for (var i = 0; i < params.length; i++) {

                        Desarrollo.deleteFile(params[i]).then(function successCallback(response) {
                        }, function errorCallback(error) {
                            Toast.show('Ocurrio un error en la solicitud.', 'alert');
                        });
                    }
                }
            };

            // Función para eliminar un Galería de la lista
            $scope.deleteListFile = function(index, doc) {
                $scope.files.splice(index, 1);
                $scope.deleted.push(doc);
            };

            // Función que sirve para guardar un Desarrollo
            $scope.save = function(data) {

                var valid    = true;
                $scope.fecha = new Date();

                if($scope.objectDesarrollo.nombre == '') {
                    Toast.show('Agrega un nombre.', 'alert');
                    valid = false;
                    return;
                }

                if($scope.objectDesarrollo.idEstado == null) {
                    Toast.show('Selecciona un estado.', 'alert');
                    valid = false;
                    return;
                }

                if($scope.path == undefined && $scope.path == '') {
                    Toast.show('Agrega una fotografía.', 'alert');
                    valid = false;
                    return;
                }

                if($scope.path2 == undefined && $scope.path2 == '') {
                    Toast.show('Agrega un logo.', 'alert');
                    valid = false;
                    return;
                }

                if(valid) {

                    $scope.disabled = true;

                    if($scope.path3 == undefined && $scope.path3 == '') 
                        $scope.objectDesarrollo.svg = $scope.path3;

                    if($scope.pdf == undefined && $scope.pdf == '') 
                        $scope.objectDesarrollo.brochure = $scope.pdf;

                    $scope.objectDesarrollo.imagen     = $scope.path;
                    $scope.objectDesarrollo.logo       = $scope.path2;
                    $scope.objectDesarrollo.amenidades = $scope.files;
                    $scope.objectDesarrollo.fecha      = $scope.convertFormatDate($scope.fecha); 

                    $scope.destroyListFiles($scope.deleted);

                    Desarrollo.saveDesarrollo($scope.objectDesarrollo)
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

            // Función que sirve para editar un Desarrollo
            $scope.update = function() {

                var valid = true;

                if($scope.objectDesarrollo.nombre == '') {
                    Toast.show('Agrega un nombre', 'alert');
                    valid = false;
                }

                if($scope.objectDesarrollo.idEstado == null) {
                    Toast.show('Selecciona un estado.', 'alert');
                    valid = false;
                    return;
                }

                if(valid) {

                    $scope.disabled = true;

                    if($scope.path != undefined && $scope.path != '') {

                        if($scope.objectDesarrollo.imagen != $scope.imagen)
                            $scope.destroyFiles($scope.objectDesarrollo.imagen);

                        $scope.objectDesarrollo.imagen = $scope.path;
                    }

                    if($scope.path2 != undefined && $scope.path2 != '') {

                        if($scope.objectDesarrollo.logo != $scope.imagen2)
                            $scope.destroyFiles($scope.objectDesarrollo.logo);

                        $scope.objectDesarrollo.logo = $scope.path2;
                    }

                    if($scope.path3 != undefined && $scope.path3 != '') {

                        if($scope.objectDesarrollo.svg != $scope.imagen3)
                            $scope.destroyFiles($scope.objectDesarrollo.svg);

                        $scope.objectDesarrollo.svg = $scope.path3;
                    }

                    if($scope.pdf != undefined && $scope.pdf != '') {

                        if($scope.objectDesarrollo.brochure != $scope.ruta)
                            $scope.destroyFiles($scope.objectDesarrollo.brochure);

                        $scope.objectDesarrollo.brochure = $scope.pdf;
                    }

                    $scope.objectDesarrollo.amenidades = $scope.files;
                    $scope.destroyListFiles($scope.deleted);

                    Desarrollo.updateDesarrollo($scope.objectDesarrollo.id, $scope.objectDesarrollo)
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

            $scope.getEstados();
        };

        function modalGalleryController($scope, $mdDialog, idDesarrollo) {

            $scope.updating = false;
            $scope.disabled = false;
            $scope.files    = [];
            $scope.temp     = [];
            $scope.deleted  = [];

            // Objeto de Galeria
            $scope.objectGaleria = {
                id: null,
                idDesarrollo: idDesarrollo, 
                titulo: '', 
                slug: '',
                fecha: '',
                imagenes: [],
                estatus: 1
            };

            // Función que devuelve la galería existente
            $scope.getGaleria = function(param) {

                Galeria.getGaleria(param).then(function successCallback(response) {

                    console.log(response.data.id);

                    if(response.data.id != undefined) {

                        $scope.updating      = true;

                        $scope.objectGaleria = response.data;
                        $scope.files         = response.data.imagenes;
                    }
                
                }, function errorCallback(error) {
                    Toast.show('Ocurrio un error en la solicitud.', 'alert');
                });
            };

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
                                        idDesarrollo: null,
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

            // Función para eliminar un Galería de la lista
            $scope.deleteDocument = function(index, doc) {
                $scope.files.splice(index, 1);
                $scope.deleted.push(doc);
            };

            // Función que sirve para guardar una Galería
            $scope.save = function(data) {

                var valid    = true;
                $scope.fecha = new Date();

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

            // Función que sirve para editar una Galería
            $scope.update = function() {

                var valid = true;

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

             $scope.getGaleria(idDesarrollo);
        };
    }
]);


