angular.module('contactoCtrl', ['contactoService'])
.controller('contactoController', ['$scope', '$rootScope', '$location', 'Contacto', 'Toast', '$localStorage', '$mdDialog',
    function ($scope, $rootScope, $location, Contacto, Toast, $localStorage, $mdDialog) {

        $rootScope.seccionName = "Contacto";

        $scope.grid   = [];
        $scope.search = "";

        $scope.getDataGrid = function (argument) {

            $scope.grid = [];

            Contacto.getComentarios().then(function successCallback(response) {

                $scope.grid = response.data;

            }, function errorCallback(error) {

                Toast.show("Ocurrio un error en la solicitud", "alert");
            });
        };

        $scope.ordenar = function(params) {
            $scope.orden = !$scope.orden;
            $scope.campo = params;
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
                
                Contacto.deleteComentario(params.id)
                .then(function successCallback(response) {

                    $scope.getDataGrid();
                    Toast.show(response.data.mensaje, response.data.estatus);

                }, function errorCallback(error) {

                    console.log(error.data);
                    Toast.show('Ocurrio un error en la solicitud.','alert');
                });

            });
        };

        $scope.getDataGrid();
    }
]);


