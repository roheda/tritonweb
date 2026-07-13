angular.module('menuCtrl', ['menuService', 'angularFileUpload'])
    .controller('menuController', ['$scope', '$mdDialog', "Toast", "$upload", '$timeout', '$rootScope', '$location', '$route', 'Menu', '$localStorage', '$sessionStorage', '$templateCache',
        function ($scope, $mdDialog, Toast, $upload, $timeout, $rootScope, $location, $route, Menu, $localStorage, $sessionStorage, $templateCache) {

            $rootScope.seccionName = "";

            $scope.$on('$routeChangeStart', function ($ev, current, previous) {
                $rootScope.loadingRentit = false;
            });

            $rootScope.$on('$viewContentLoaded', function () {
                
                $('#loadingFrame').css({
                    'visibility': 'show',
                    'display': 'none'
                });

                $templateCache.removeAll();
            });            

            $scope.loadOptions = {
                shadingColor: "rgba(0, 0, 0, 1)",
                position: { my: 'center', at: 'center', of: window},
                message: "Cargando ...",
                bindingOptions: {
                    visible: "loadingRentit",
                }
            };

            $scope.datosUsuario = {};
            $scope.submenus     = [];
            $scope.clock        = '';

            // Función que cambia la hora cada segundo
            var nextSecond = function () {
                $scope.reloj = Date.now();
                $timeout(nextSecond, 1000);
            };

            // Función que devuelve los permisos del usuariosssssss
            $scope.getPermisos = function() {

                Menu.GetPermisosMenu().then(function successCallback(response) {

                    $scope.datosUsuario = response.data;

                    if ($scope.datosUsuario != undefined) {

                        for (var i = 0; i < $scope.datosUsuario.menu.length; i++) {

                            if (!$scope.datosUsuario.menu[i].hasOwnProperty('submenu'))
                                $scope.submenus.push("expand_more");
                        }
                    }

                }, function errorCallback(error) { console.log(error); });
            };

            // Función que se activa al dar clic a un elemento del menú
            $scope.activeMenu = function (index, submenu, ruta) {

                if (submenu != undefined) {

                    for (var i = 0; i < $scope.submenus.length; i++) {

                        if (i == index) {

                            if($scope.submenus[index] == 'expand_more')
                                $scope.submenus[index] = 'expand_less';

                            else 
                                $scope.submenus[index] = 'expand_more';

                        } else
                            $scope.submenus[i] = 'expand_more';
                    }                    
                }

                if (ruta != undefined) {
                    $location.path(ruta);
                }
            };
           
            $scope.getPermisos();
            $timeout(nextSecond, 1000);

            $scope.openPopup = function (ev) {

                $mdDialog.show({
                    controller: userController,
                    templateUrl: '/administrador/partials/popups/perfilUsuario.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                })
            };

            function userController($scope, $mdDialog) {

                $scope.objectUser = {
                    'nombre': '',
                    'apellidoPaterno': '',
                    'apellido': '',
                    'email': '',
                    'path': '',
                    'username': '',
                    'password': '',
                    'confirmedPassword': ''
                };

                $scope.checkboxModel = {
                    value1: false,
                    value2: 'YES'
                };

                $scope.verificar = function () {

                    if (!$scope.checkboxModel.value1) {

                        $scope.mostrarpassword = true;
                        $scope.mostrarconfirmepassword = true;

                    } else {

                        $scope.mostrarpassword = false;
                        $scope.mostrarconfirmepassword = false;

                    }
                };

                $scope.getUser = function () {

                    Menu.GetUser().then(function successCallback(response) {

                        $scope.objectUser.id           = data[0].id;
                        $scope.objectUser.nombre       = data[0].nombre;
                        $scope.objectUser.apPaterno    = data[0].apPaterno;
                        $scope.objectUser.apMaterno    = data[0].apMaterno;
                        $scope.objectUser.email        = data[0].email;
                        $scope.objectUser.username     = data[0].username;
                        $scope.objectUser.path         = data[0].path;
                        $scope.mostrarpassword         = false;
                        $scope.mostrarconfirmepassword = false;

                    }, function errorCallback(error) { console.log(error); });
                };

                $scope.getUser();

                $scope.actualizarPerfil = function (params) {

                    console.log(params);

                    if ($scope.objectUser.password != $scope.objectUser.confirmedPassword) {

                        Toast.show('Las contraseñas no concuerdan', 'alert');

                    } else {

                        var validar = params.validationGroup.validate();
                        if (validar.isValid) {

                            if ($scope.path != undefined) {
                                $scope.objectUser.path = $scope.path;
                            } else {
                                $scope.objectUser.path = "";
                            }

                            $mdDialog.hide();

                            Menu.updatePerfil($scope.objectUser.id, $scope.objectUser)
                                .success(function (data) {
                                    Toast.show("Los datos del usuario han sido actualizados", 'success');
                                });

                        } else {
                            Toast.show('Complete los campos.', 'alert');
                        }
                    }
                };

                $scope.onFileSelect = function ($files) {

                    $scope.loading = true;

                    setTimeout(function () {

                        if ($files.length > 10) {
                            $scope.alerts.push({
                                type: 'alert',
                                msg: 'Solo puedes seleccionar 10 archivos a la vez.'
                            });
                            return;
                        }

                        $scope.finished = 0;
                        $scope.selectedFiles = [];
                        $scope.progress = [];
                        $scope.type = [];
                        $scope.alerts = [];
                        $scope.isLoading = true;

                        cleanRequests();

                        $scope.upload = [];
                        $scope.selectedFiles = $files;

                        for (var i = 0; i < $files.length; i++) {
                            var file = $files[i];
                            $scope.progress[i] = -1;
                            $scope.type[i] = 'primary';
                            $scope.start(i);
                        }

                    }, 1000);
                };

                $scope.onSelectPage = function (page) {

                    $scope.params.page = page;

                    Galeria.getAllFotos($scope.params)
                        .success(function (fotografias) {
                            $scope.fotografiasList = fotografias;
                        });
                };

                $scope.start = function (index) {

                    $scope.progress[index] = 0;
                    var url = '/admin/uploadfoto';

                    $scope.upload[index] = $upload.upload({
                        url: url,
                        method: 'POST',
                        data: {
                            type: 'file'
                        },
                        file: $scope.selectedFiles[index],
                    });

                    $scope.upload[index].then(function (response) {
                            console.log(response);

                            $scope.finished++;

                            var direc = response.data.file.path;
                            $scope.path = direc;

                            $('#img_cargada').html('<img src="../../../' + direc + '"width=250 height=250 />');
                            $scope.type[index] = 'success';

                            if ($scope.finished == $scope.upload.length) {
                                $scope.isLoading = false;
                            }
                        },
                        function (response) {

                            $scope.finished++;
                            $scope.type[index] = 'alert';

                            if ($scope.finished == $scope.upload.length) {
                                $scope.isLoading = false;
                            }
                        },
                        function (evt) {
                            $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                        });
                    $scope.upload[index].xhr(function (xhr) {
                        console.log('xhr');
                        $scope.loading = false;
                    });
                };

                $scope.ok = function () {
                    $scope.valueProgress = 0;
                    $scope.selectedFiles = [];
                    $scope.alerts = [];
                    modalUploadFile.dismiss('cancel');
                };

                cleanRequests = function () {
                    if ($scope.upload && $scope.upload.length > 0) {
                        for (var i = 0; i < $scope.upload.length; i++) {
                            if ($scope.upload[i] != null) {
                                $scope.upload[i].abort();
                            }
                        }
                    }
                };

                $scope.abort = function (index) {
                    $scope.upload[index].abort();
                    $scope.upload[index] = null;
                };

                $scope.hasUploader = function (index) {
                    return $scope.upload[index] != null;
                };
            };

            // // Función para abrir el menú
            // $scope.toggleSidenav = function (menuId) {
            //     $mdSidenav(menuId).toggle();
            // };

            // $scope.isActive = function (path) {
            //     if ($route.current && $route.current.regexp) {
            //         return $route.current && $route.current.regexp.test(path);
            //     }
            //     return false;
            // };            
        }
    ]);