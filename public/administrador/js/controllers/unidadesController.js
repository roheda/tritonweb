angular.module('unidadesCtrl', ['unidadesService', 'angularFileUpload', 'desarrollosService'])
.controller('unidadesController', ['$scope', '$rootScope', 'Unidad', 'Toast', '$mdDialog', '$upload',
    function($scope, $rootScope, Unidad, Toast, $mdDialog, $upload) {

        $rootScope.seccionName = 'Disponibilidad';

        $scope.grid = [];
        $scope.desarrollos = [];
        $scope.search = '';
        $scope.idDesarrollo = 0;
        $scope.desarrolloSeleccionado = null;
        $scope.loadingGrid = false;
        $scope.summary = {
            total: 0,
            disponibles: 0,
            apartadas: 0,
            cerradas: 0
        };

        $scope.getDesarrollos = function() {
            Unidad.getDesarrollos().then(function(response) {
                $scope.desarrollos = response.data || [];
            }, function() {
                Toast.show('No fue posible cargar los desarrollos.', 'alert');
            });
        };

        $scope.onDevelopmentChange = function() {
            $scope.desarrolloSeleccionado = null;

            for (var i = 0; i < $scope.desarrollos.length; i++) {
                if (parseInt($scope.desarrollos[i].id, 10) === parseInt($scope.idDesarrollo, 10)) {
                    $scope.desarrolloSeleccionado = $scope.desarrollos[i];
                    break;
                }
            }

            $scope.getDataGrid($scope.idDesarrollo);
        };

        $scope.getDataGrid = function(idDesarrollo) {
            $scope.grid = [];
            $scope.resetSummary();

            if (!idDesarrollo || parseInt(idDesarrollo, 10) === 0) {
                return;
            }

            $scope.loadingGrid = true;

            Unidad.getUnidad(idDesarrollo).then(function(response) {
                $scope.grid = response.data || [];

                for (var i = 0; i < $scope.grid.length; i++) {
                    $scope.grid[i].estatus = parseInt($scope.grid[i].estatus, 10);
                    $scope.grid[i].construccion = parseFloat($scope.grid[i].construccion || 0);
                    $scope.grid[i].terreno = parseFloat($scope.grid[i].terreno || 0);
                    $scope.grid[i].precio = parseFloat($scope.grid[i].precio || 0);
                }

                $scope.recalculateSummary();
                $scope.loadingGrid = false;
            }, function() {
                $scope.loadingGrid = false;
                Toast.show('No fue posible cargar las unidades.', 'alert');
            });
        };

        $scope.resetSummary = function() {
            $scope.summary.total = 0;
            $scope.summary.disponibles = 0;
            $scope.summary.apartadas = 0;
            $scope.summary.cerradas = 0;
        };

        $scope.recalculateSummary = function() {
            $scope.resetSummary();
            $scope.summary.total = $scope.grid.length;

            for (var i = 0; i < $scope.grid.length; i++) {
                var status = parseInt($scope.grid[i].estatus, 10);
                if (status === 2) {
                    $scope.summary.disponibles++;
                } else if (status === 1) {
                    $scope.summary.apartadas++;
                } else {
                    $scope.summary.cerradas++;
                }
            }
        };

        $scope.isRent = function() {
            return $scope.desarrolloSeleccionado && $scope.desarrolloSeleccionado.tipo_operacion === 'renta';
        };

        $scope.statusOptions = function() {
            return [
                { value: 2, text: 'Disponible' },
                { value: 1, text: $scope.isRent() ? 'En negociación' : 'Apartada' },
                { value: 0, text: $scope.isRent() ? 'Rentada' : 'Vendida' }
            ];
        };

        $scope.statusLabel = function(status) {
            status = parseInt(status, 10);
            if (status === 2) return 'Disponible';
            if (status === 1) return $scope.isRent() ? 'En negociación' : 'Apartada';
            return $scope.isRent() ? 'Rentada' : 'Vendida';
        };

        $scope.closedLabel = function() {
            return $scope.isRent() ? 'Rentadas' : 'Vendidas';
        };

        $scope.reservedLabel = function() {
            return $scope.isRent() ? 'En negociación' : 'Apartadas';
        };

        $scope.itemLabel = function(plural) {
            var product = (($scope.desarrolloSeleccionado && $scope.desarrolloSeleccionado.tipo_producto) || '').toLowerCase();
            var isLocal = product.indexOf('local') !== -1;

            if (isLocal) return plural ? 'locales' : 'local';
            if ($scope.isRent()) return plural ? 'espacios' : 'espacio';
            return plural ? 'unidades' : 'unidad';
        };

        $scope.urgencyText = function() {
            var available = $scope.summary.disponibles;
            var noun = $scope.itemLabel(available !== 1);

            if ($scope.summary.total === 0) {
                return 'Agrega el inventario para publicar disponibilidad verificable.';
            }
            if (available === 0) {
                return $scope.isRent() ? 'Sin espacios disponibles actualmente.' : '100% vendido.';
            }
            if (available === 1) {
                return 'Últim' + ($scope.itemLabel(false) === 'unidad' ? 'a' : 'o') + ' ' + noun + ' disponible.';
            }
            if (available <= 3) {
                return 'Últimos ' + available + ' ' + noun + ' disponibles.';
            }
            if (available <= 5) {
                return 'Disponibilidad limitada: ' + available + ' ' + noun + ' disponibles.';
            }
            return available + ' ' + noun + ' disponibles.';
        };

        $scope.updateStatus = function(item) {
            Unidad.updateEstatus(item.id, item.estatus).then(function(response) {
                Toast.show(response.data.mensaje, response.data.estatus);
                if (response.data.estatus === 'alert') {
                    $scope.getDataGrid($scope.idDesarrollo);
                    return;
                }

                item.updated_at_texto = 'Ahora';
                $scope.recalculateSummary();
            }, function() {
                Toast.show('No fue posible actualizar la disponibilidad.', 'alert');
                $scope.getDataGrid($scope.idDesarrollo);
            });
        };

        $scope.ordenar = function(campo) {
            $scope.orden = !$scope.orden;
            $scope.campo = campo;
        };

        $scope.openPopup = function(ev) {
            if (!$scope.idDesarrollo) return;

            $mdDialog.show({
                controller: modalController,
                templateUrl: '/administrador/partials/popups/unidad.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                locals: {
                    data: null,
                    update: false,
                    id: $scope.idDesarrollo,
                    development: $scope.desarrolloSeleccionado
                }
            }).then(function() {
                $scope.getDataGrid($scope.idDesarrollo);
            });
        };

        $scope.openEditPopup = function(ev, item) {
            $mdDialog.show({
                controller: modalController,
                templateUrl: '/administrador/partials/popups/unidad.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                locals: {
                    data: angular.copy(item),
                    update: true,
                    id: $scope.idDesarrollo,
                    development: $scope.desarrolloSeleccionado
                }
            }).then(function() {
                $scope.getDataGrid($scope.idDesarrollo);
            });
        };

        $scope.deleteRegister = function(ev, item) {
            var confirm = $mdDialog.confirm()
                .title('¿Eliminar ' + item.clave + '?')
                .textContent('Esta acción eliminará la unidad del inventario y afectará el conteo público.')
                .ariaLabel('Confirmación')
                .targetEvent(ev)
                .cancel('Cancelar')
                .ok('Eliminar');

            $mdDialog.show(confirm).then(function() {
                Unidad.deleteUnidad(item.id).then(function(response) {
                    Toast.show(response.data.message, response.data.status);
                    $scope.getDataGrid($scope.idDesarrollo);
                }, function() {
                    Toast.show('No fue posible eliminar la unidad.', 'alert');
                });
            });
        };

        $scope.getDesarrollos();

        function modalController($scope, $mdDialog, data, update, id, development) {
            $scope.updating = update;
            $scope.disabled = false;
            $scope.development = development || {};
            $scope.isRent = $scope.development.tipo_operacion === 'renta';
            $scope.loading = false;
            $scope.loadingBrochure = false;
            $scope.tempImage = '';
            $scope.tempBrochure = '';

            $scope.objectUnidad = data || {
                idDesarrollo: id,
                clave: '',
                descripcion: '',
                brochure: '',
                equipamiento: '',
                imagen: '',
                tipo: '',
                estatus: 2,
                construccion: 0,
                terreno: 0,
                precio: 0,
                largo: 0,
                ancho: 0,
                precio24: 0,
                precio48: 0,
                precio60: 0,
                precio72: 0
            };

            $scope.objectUnidad.idDesarrollo = id;
            $scope.objectUnidad.estatus = parseInt($scope.objectUnidad.estatus, 10);
            $scope.objectUnidad.construccion = parseFloat($scope.objectUnidad.construccion || 0);
            $scope.objectUnidad.terreno = parseFloat($scope.objectUnidad.terreno || 0);
            $scope.objectUnidad.precio = parseFloat($scope.objectUnidad.precio || 0);

            $scope.statuses = [
                { value: 2, text: 'Disponible' },
                { value: 1, text: $scope.isRent ? 'En negociación' : 'Apartada' },
                { value: 0, text: $scope.isRent ? 'Rentada' : 'Vendida' }
            ];

            $scope.cancel = function() {
                $scope.destroyTempFiles();
                $mdDialog.cancel();
            };

            $scope.onFileSelect = function(files) {
                if (!files || !files.length) return;
                $scope.loading = true;

                $upload.upload({
                    method: 'POST',
                    url: '/dashboard/uploadImagen',
                    data: { type: 'file' },
                    file: files[0]
                }).then(function(response) {
                    $scope.tempImage = response.data.file;
                    $scope.objectUnidad.imagen = response.data.file;
                    $scope.loading = false;
                }, function() {
                    $scope.loading = false;
                    Toast.show('No fue posible cargar la imagen.', 'alert');
                });
            };

            $scope.onFilePDFSelect = function(files) {
                if (!files || !files.length) return;
                $scope.loadingBrochure = true;

                $upload.upload({
                    method: 'POST',
                    url: '/dashboard/uploadFile',
                    data: { type: 'file' },
                    file: files[0]
                }).then(function(response) {
                    var file = response.data.file;
                    $scope.tempBrochure = file.ruta || file;
                    $scope.objectUnidad.brochure = $scope.tempBrochure;
                    $scope.loadingBrochure = false;
                }, function() {
                    $scope.loadingBrochure = false;
                    Toast.show('No fue posible cargar el brochure.', 'alert');
                });
            };

            $scope.destroyTempFiles = function() {
                var paths = [$scope.tempImage, $scope.tempBrochure];
                for (var i = 0; i < paths.length; i++) {
                    if (paths[i]) {
                        Unidad.deleteFile({ ruta: paths[i] });
                    }
                }
            };

            $scope.validate = function() {
                if (!$scope.objectUnidad.clave || !$scope.objectUnidad.clave.trim()) {
                    Toast.show('Escribe la clave de la unidad o local.', 'alert');
                    return false;
                }
                if (!$scope.objectUnidad.tipo || !$scope.objectUnidad.tipo.trim()) {
                    Toast.show('Escribe el tipo de unidad o local.', 'alert');
                    return false;
                }
                return true;
            };

            $scope.save = function() {
                if (!$scope.validate()) return;
                $scope.disabled = true;

                Unidad.saveUnidad($scope.objectUnidad).then(function(response) {
                    $scope.disabled = false;
                    Toast.show(response.data.mensaje, response.data.estatus);
                    if (response.data.estatus !== 'alert') {
                        $scope.tempImage = '';
                        $scope.tempBrochure = '';
                        $mdDialog.hide();
                    }
                }, function() {
                    $scope.disabled = false;
                    Toast.show('No fue posible guardar la unidad.', 'alert');
                });
            };

            $scope.update = function() {
                if (!$scope.validate()) return;
                $scope.disabled = true;

                Unidad.updateUnidad($scope.objectUnidad.id, $scope.objectUnidad).then(function(response) {
                    $scope.disabled = false;
                    Toast.show(response.data.mensaje, response.data.estatus);
                    if (response.data.estatus !== 'alert') {
                        $scope.tempImage = '';
                        $scope.tempBrochure = '';
                        $mdDialog.hide();
                    }
                }, function() {
                    $scope.disabled = false;
                    Toast.show('No fue posible actualizar la unidad.', 'alert');
                });
            };
        }
    }
]);
