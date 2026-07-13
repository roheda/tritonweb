angular.module('unidadesCtrl', ['unidadesService', 'angularFileUpload', 'desarrollosService'])
.controller('unidadesController', ['$scope', '$rootScope', '$location', 'Unidad', 'Desarrollo', 'Toast', '$localStorage', '$mdDialog', '$upload',
    function ($scope, $rootScope, $location, Unidad, Desarrollo, Toast, $localStorage, $mdDialog, $upload) {

        $rootScope.seccionName = "Unidades";

        $scope.grid         = [];
        $scope.desarrollos  = [];
        $scope.search       = "";
        $scope.idDesarrollo = 0;

        $scope.getDataGrid = function (argument) {

            $scope.grid = [];
            console.log(argument);

            Unidad.getUnidad(argument).then(function successCallback(response) {
                
                for (var i = 0; i < response.data.length; i++) {                    
                    response.data[i].fecha = new Date(response.data[i].fecha);
                }

                $scope.grid = response.data;

            }, function errorCallback(error) {
                Toast.show("Ocurrio un error en la solicitud", "alert");
            });
        };

        $scope.getDesarrollos = function (argument) {

            $scope.desarrollos = [];

            Desarrollo.getDesarrollos().then(function successCallback(response) {

                $scope.desarrollos = response.data;

            }, function errorCallback(error) {
                Toast.show("Ocurrio un error en la solicitud", "alert");
            });
        };

        $scope.ordenar = function(params) {
            $scope.orden = !$scope.orden;
            $scope.campo = params;
        };

        $scope.changeStatus = function (params) {
        
            Unidad.equipoEstatus(params.id).then(function successCallback(response) {
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
                
                Unidad.deleteUnidad(params.id).then(function successCallback(response) {

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
                templateUrl: '/administrador/partials/popups/unidad.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                locals: { 
                    data: undefined,
                    update: false,
                    id: $scope.idDesarrollo
                },
            })
            .then(function(data) {
                $scope.getDataGrid($scope.idDesarrollo);
            }, function() {});
        };

        $scope.openEditPopup = function (ev, params) {

            $mdDialog.show({
                controller: modalController,
                templateUrl: '/administrador/partials/popups/unidad.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                locals: { 
                    data: params, 
                    update: true,
                    id: $scope.idDesarrollo
                },
            })
            .then(function(data) {
                $scope.getDataGrid($scope.idDesarrollo);
            }, function() {});
        };

        $scope.uploadExcel = function (files) {
            $scope.selectExcel = files[0];
            $scope.showFile($scope.selectExcel);
        };

        $scope.showFile = function(obj) { 

            console.log(obj);

            var reader = new FileReader();
            reader.readAsBinaryString(obj);    
      
            reader.onload = function(e) { 
      
               var target   = e.target.result; 
               var workbook = XLSX.read(target, { type: 'binary' });
      
               workbook.SheetNames.forEach(function(sheetName) { 
      
                  var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]); 
                  var json_object   = JSON.stringify(XL_row_object);
                  var jsonData      = JSON.parse(json_object);
      
                  data = jsonData;
                  $scope.openExcelPopup(data);
                  console.log(data);
               }) 
            }; 
      
            reader.onerror = function(ex) { 
               console.log(ex); 
            }; 
        };

        $scope.openExcelPopup = function (params) {

            if($scope.idDesarrollo != "" && params.length > 0) {

                $mdDialog.show({
                    controller: excelController,
                    templateUrl: '/administrador/partials/popups/excel.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    locals: { 
                        data: params,
                        id: $scope.idDesarrollo
                    },
                })
                .then(function(data) {
                    $scope.getDataGrid($scope.idDesarrollo);
                }, function() {});
            }
        };

        $scope.getDesarrollos();

        function modalController($scope, $mdDialog, data, update, id) {

            $scope.objectUnidad = {
                idDesarrollo: id,
                clave: '',
                descripcion: '',
                brochure: '',
                equipamiento: 'Ninguno',
                imagen: '',
                tipo: 'Normal',
                estatus: 2,
                construccion: 0.0,
                terreno: 0.0,
                precio: 0.0,
                largo: 0.0,
                ancho: 0.0,
                precio24: 0.0,
                precio48: 0.0,
                precio60: 0.0,
                precio72: 0.0,
            };

            console.log($scope.objectUnidad.idDesarrollo)

            $scope.disponible = [
                { id: 1, text: "No Disponible", value: 0 },
                { id: 2, text: "Apartado", value: 1 },
                { id: 3, text: "Disponible", value: 2 }
            ];

            $scope.tipos = [
                { id: 1, text: "Esquina", value: 1 },
                { id: 2, text: "Normal", value: 2 },
                { id: 3, text: "Plus", value: 3 }
            ];

            $(".input-file").val("");

            $scope.loadingBrochure = false;

            $scope.desarrollos = [];
            $scope.disabled    = false;
            $scope.updating    = update;
            $scope.path        = '';
            $scope.pdf         = '';
            $scope.selectExcel = null;

            $scope.imagen   = '../administrador/images/notImage.png';
            $scope.ruta     = '';
            $scope.brochure = '';

            // Función que devuelve la galería existente
            $scope.getDesarrollos = function() {

                Unidad.getDesarrollos().then(function successCallback(response) {
                    $scope.desarrollos = response.data;
                }, function errorCallback(error) {
                    Toast.show('Ocurrio un error en la solicitud.', 'alert');
                });
            };

            $scope.getDesarrollos();

            if(data != undefined) {
                
                setTimeout(function() { 

                    $scope.objectUnidad = data; 

                    $scope.objectUnidad.construccion = parseFloat(data.construccion); 
                    $scope.objectUnidad.terreno      = parseFloat(data.terreno); 
                    $scope.objectUnidad.precio       = parseFloat(data.precio);
                    
                    $scope.imagen   = data.imagen;
                    $scope.brochure = data.brochure                
                    
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

                Unidad.deleteFile(obj).then(function successCallback(response) {
                    console.log();
                }, function errorCallback(error) {
                    Toast.show('Ocurrio un error en la solicitud.', 'alert');
                });
            };

            // Función que sirve para guardar un Unidad
            $scope.save = function(data) {

                var valid = true;

                if($scope.objectUnidad.nombre == '') {
                    Toast.show('Agrega un nombre', 'alert');
                    valid = false;
                }

                if($scope.objectUnidad.puesto == '') {
                    Toast.show('Agrega una puesto', 'alert');
                    valid = false;
                }

                if($scope.path == undefined && $scope.path == '') {
                    Toast.show('Agrega una fotografía', 'alert');
                    valid = false;
                }

                if(valid) {

                    $scope.disabled            = true;
                    $scope.objectUnidad.imagen = $scope.path;

                    if($scope.pdf == undefined && $scope.pdf == '') 
                        $scope.objectUnidad.brochure = $scope.pdf;

                    Unidad.saveUnidad($scope.objectUnidad)
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

            // Función que sirve para editar un Unidad
            $scope.update = function() {

                var valid = true;

                if($scope.objectUnidad.nombre == '') {
                    Toast.show('Agrega un nombre', 'alert');
                    valid = false;
                }

                if($scope.objectUnidad.puesto == '') {
                    Toast.show('Agrega una puesto', 'alert');
                    valid = false;
                }

                if(valid) {

                    $scope.disabled = true;

                    if($scope.path != undefined && $scope.path != '') {

                        if($scope.objectUnidad.imagen != $scope.imagen)
                            $scope.destroyFiles($scope.objectUnidad.imagen);

                        $scope.objectUnidad.imagen = $scope.path;
                    }

                    if($scope.pdf != undefined && $scope.pdf != '') {

                        if($scope.objectUnidad.brochure != $scope.ruta)
                            $scope.destroyFiles($scope.objectUnidad.brochure);

                        $scope.objectUnidad.brochure = $scope.pdf;
                    }

                    Unidad.updateUnidad($scope.objectUnidad.id, $scope.objectUnidad)
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

        function excelController($scope, $mdDialog, data, id) {

            $scope.objectUnidad = {
                idDesarrollo: id,
                clave: '',
                descripcion: '',
                brochure: '',
                equipamiento: 'Ninguno',
                imagen: '',
                tipo: 'Normal',
                estatus: 2,
                construccion: 0.0,
                terreno: 0.0,
                precio: 0.0,
                largo: 0.0,
                ancho: 0.0,
                precio24: 0.0,
                precio48: 0.0,
                precio60: 0.0,
                precio72: 0.0,
            };

            console.log(data);
            console.log($scope.objectUnidad.idDesarrollo);

            $scope.dataExcel = [];

            if(data != undefined)
                $scope.dataExcel = data;

            // Función para cancelar el modal
            $scope.hide = function() {
                $mdDialog.hide();
            };

            // Función para cancelar el modal
            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            // Función que sirve para guardar un Unidad
            $scope.save = function(data) {

                var valid = true;

                if(id == '') {
                    Toast.show('Selecciona un desarrollo', 'alert');
                    valid = false;
                }

                if($scope.dataExcel.length <= 0) {
                    Toast.show('No se encontraron datos', 'alert');
                    valid = false;
                }

                if(valid) {

                    $scope.disabled = true;

                    for (let i = 0; i < $scope.dataExcel.length; i++) {

                        const element = array[i];
    
                        $scope.objectUnidad.clave        = element.clave;
                        $scope.objectUnidad.descripcion  = element.descripcion;
                        $scope.objectUnidad.equipamiento = element.equipamiento;
                        $scope.objectUnidad.tipo         = element.tipo;
                        $scope.objectUnidad.estatus      = element.estatus;
                        $scope.objectUnidad.construccion = element.construccion;
                        $scope.objectUnidad.terreno      = element.terreno;
                        $scope.objectUnidad.precio       = element.precio;
    
                        console.log($scope.objectUnidad);
                    }

                    // Unidad.saveUnidad($scope.objectUnidad)
                    // .then(function successCallback(response) {

                    //     Toast.show(response.data.mensaje, response.data.estatus);
                    //     $scope.disabled = false;
                        
                    //     if (response.data.estatus != "alert")
                    //         $mdDialog.hide(data);

                    // }, function errorCallback(error) {
                    //     $scope.disabled = false;
                    //     Toast.show("Ocurrio un error en la solicitud", "alert");
                    // });
                }
            };           
        };
    }
]);


