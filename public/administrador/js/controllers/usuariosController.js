angular.module('usuariosCtrl', ['usuariosService', 'angularFileUpload'])
.controller('usuariosController', ['$scope', '$rootScope', '$upload', 'Usuario', 'Toast', '$localStorage', '$mdDialog',
    function($scope, $rootScope, $upload, Usuario, Toast, $localStorage, $mdDialog) {

        $rootScope.seccionName = 'Usuarios';

        $scope.grid   = [];
        $scope.search = "";

        $scope.getDataGrid = function (argument) {

            $scope.grid = [];

            Usuario.getUsuarios().then(function successCallback(response) {

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
        
            Usuario.UsuarioEstatus(params.id).then(function successCallback(response) {
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
                
                Usuario.deleteUsuario(params.id).then(function successCallback(response) {

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
                templateUrl: '/administrador/partials/popups/usuario.html',
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
                templateUrl: '/administrador/partials/popups/usuario.html',
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

            // Objeto de Usuario
            $scope.objectUsuario = {
                id: null,
                nombre: '',
                apPaterno: '',
                apMaterno: '',
                username: '',
                password: '',
                email: '',
                path: '',
                permisos: [],
                password: ''
            };

            $scope.userPassword = '';
            $scope.confirmPass  = '';

            $(".input-file").val("");

            $scope.contrasenia = true;
            $scope.passView    = false;
            $scope.disabled    = false;
            $scope.selectAll   = false;
            $scope.updating    = update;
            $scope.roles       = [];
            $scope.path        = '';

            $scope.imagen = '../administrador/images/notImage.png';

            if(data != undefined) {

                setTimeout(function() {    

                    $scope.contrasenia = false;
                    $scope.passView    = true;

                    $scope.objectUsuario = data; 
                    $scope.imagen        = data.path;

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

            // Función que devuelve todos los puestos activos
            $scope.getPermisos = function() {

                Usuario.getPermisos().then(function successCallback(response) {

                    $scope.permisos = response.data;

                    if(data != undefined) {

                        for (var i = 0; i < data.permisos.length; i++) {
                            
                            var element = $scope.permisos.find(y => y.id == data.permisos[i].id);

                            if(element != null)
                                element.checked = true;
                        }

                        if(data.permisos.length == $scope.permisos.length)
                            $scope.selectAll = true;
                    }
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

            // Función que sirve para eliminar fisicamente los archivos
            $scope.destroyFiles = function(params) {

                var obj = {
                    ruta: params
                };

                Usuario.deleteFile(obj).then(function successCallback(response) { }, function errorCallback(error) { Toast.show("Ocurrio un error en la solicitud", "alert"); });
            };

            // Función para seleccional todos los permisos
            $scope.checkAll = function() {

                $scope.selectAll = !$scope.selectAll;

                for (var i = 0; i < $scope.permisos.length; i++) {
                    
                    if($scope.selectAll)
                        $scope.permisos[i].checked = true;

                    if(!$scope.selectAll)
                        $scope.permisos[i].checked = false;
                }
            };

            // Función que sirve para guardar un Usuario
            $scope.save = function(params) {

                var valid = true;
                var permisosActivos = [];

                if($scope.objectUsuario.nombre == '') {
                    Toast.show('Agrega un nombre', 'alert');
                    valid = false;
                }

                if($scope.objectUsuario.apPaterno == '') {
                    Toast.show('Agrega un apellido paterno', 'alert');
                    valid = false;
                }

                if($scope.objectUsuario.email == '') {
                    Toast.show('Agrega una email', 'alert');
                    valid = false;
                }

                for (var i = 0; i < $scope.permisos.length; i++) {
                
                    if($scope.permisos[i].checked == true)
                        permisosActivos.push($scope.permisos[i]);
                }

                if(permisosActivos.length <= 0) {
                    Toast.show('Selecciona al menos un permiso', 'alert');
                    valid = false;
                }

                if($scope.path == undefined && $scope.path == '') {
                    Toast.show('Agrega una fotografía', 'alert');
                    valid = false;
                }

                if($scope.userPassword == '' || $scope.confirmPass == '') {
                    Toast.show('Escribe una contraseña', 'alert');
                    valid = false;
                }

                if($scope.userPassword != $scope.confirmPass) {
                    Toast.show('Las contraseñas no coinciden', 'alert');
                    valid = false;
                }

                if($scope.userPassword.length <= 6) {
                    Toast.show('La contraseña debe tener mas de 6 caracteres', 'alert');
                    valid = false;
                }

                if(valid) {

                    $scope.disabled = true;

                    $scope.objectUsuario.path     = $scope.path;
                    $scope.objectUsuario.username = $scope.objectUsuario.email;
                    $scope.objectUsuario.password = $scope.userPassword;
                    $scope.objectUsuario.permisos = $scope.permisos;

                    Usuario.saveUsuario($scope.objectUsuario)
                    .then(function successCallback(response) {

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

            // Función que sirve para editar un Usuario
            $scope.update = function(params) {

                var valid = true;
                var permisosActivos = [];

                if($scope.objectUsuario.nombre == '') {
                    Toast.show('Agrega un nombre', 'alert');
                    valid = false;
                }

                if($scope.objectUsuario.apPaterno == '') {
                    Toast.show('Agrega un apellido paterno', 'alert');
                    valid = false;
                }

                if($scope.objectUsuario.email == '') {
                    Toast.show('Agrega una email', 'alert');
                    valid = false;
                }

                for (var i = 0; i < $scope.permisos.length; i++) {
                
                    if($scope.permisos[i].checked == true)
                        permisosActivos.push($scope.permisos[i]);
                }

                if(permisosActivos.length <= 0) {
                    Toast.show('Selecciona al menos un permiso', 'alert');
                    valid = false;
                }

                if($scope.contrasenia == true) {

                    if($scope.userPassword == '' || $scope.confirmPass == '') {
                        Toast.show('Escribe una contraseña', 'alert');
                        valid = false;
                    }

                    if($scope.userPassword != $scope.confirmPass) {
                        Toast.show('Las contraseñas no coinciden', 'alert');
                        valid = false;
                    }

                    if($scope.userPassword.length <= 6) {
                        Toast.show('La contraseña debe tener mas de 6 caracteres', 'alert');
                        valid = false;
                    }
                }

                if(valid) {

                    $scope.disabled = true;

                    if($scope.path != undefined && $scope.path != '') {

                        if($scope.objectUsuario.path != $scope.imagen)
                            $scope.destroyFiles($scope.objectUsuario.path);

                        $scope.objectUsuario.path = $scope.path;
                    }

                    if($scope.contrasenia == true)
                        $scope.objectUsuario.password = $scope.userPassword;

                    $scope.objectUsuario.permisos = $scope.permisos;
                    $scope.objectUsuario.username = $scope.objectUsuario.email;

                    Usuario.updateUsuario($scope.objectUsuario.id, $scope.objectUsuario)
                    .then(function successCallback(response) {

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

            $scope.getPermisos();
        };
    }
]);

/** Función para parsear fechas **/
Date.prototype.ddmmyyyy = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();
    return (dd[1] ? dd : "0" + dd[0]) + "/" + (mm[1] ? mm : "0" + mm[0]) + "/" + yyyy
};
