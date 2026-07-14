angular.module('detalleDesarrolloCtrl', ['desarrolloService', 'youtube-embed'])
.controller('detalleDesarrolloController', ['$scope', '$rootScope', '$routeParams', '$location', 'Desarrollo', '$mdDialog', '$mdToast', '$sce',
    function($scope, $rootScope, $routeParams, $location, Desarrollo, $mdDialog, $mdToast, $sce) {

        $scope.detailFrame = undefined;
        $scope.mapFrame = null;
        $scope.mapExternalUrl = '';
        $scope.playerVars = { autoplay: 0 };
        $scope.unidades = [];
        $scope.unidadesDisponibles = [];

        $scope.desarrollo = {
            id: null,
            idEstado: null,
            estado: '',
            nombre: '',
            descripcion: '',
            descripcion_corta: '',
            brochure: '',
            imagen: '',
            logo: '',
            svg: '',
            slug: '',
            video: '',
            enlace: '',
            ubicacion: '',
            ubicacion_completa: '',
            zona: '',
            ciudad: '',
            direccion: '',
            mapa_url: '',
            tipo_desarrollo: '',
            tipo_operacion: '',
            tipo_producto: '',
            operacion_texto: '',
            estado_comercial: '',
            estado_comercial_texto: '',
            precio_desde: null,
            precio_texto: '',
            mostrar_precio: 1,
            etapa: '',
            informacion_comercial: '',
            esquema_pago: '',
            disponibilidad_texto: '',
            resumen_disponibilidad: '',
            unidades_disponibles: 0,
            total_unidades: 0,
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

        $scope.getDesarrollo = function() {
            Desarrollo.getDesarrollo($routeParams.detalle).then(function successCallback(response) {
                var data = response.data || {};

                angular.extend($scope.desarrollo, data);

                $scope.desarrollo.descripcion = $sce.trustAsHtml(data.descripcion || '');
                $scope.desarrollo.informacion_comercial = $sce.trustAsHtml(data.informacion_comercial || '');
                $scope.desarrollo.esquema_pago = $sce.trustAsHtml(data.esquema_pago || '');
                $scope.desarrollo.fecha = data.fecha ? new Date(data.fecha + 'T00:00:00') : new Date();
                $scope.desarrollo.enlace = data.enlace || '';
                $scope.desarrollo.svg = data.svg || '';
                $scope.desarrollo.brochure = data.brochure || '';
                $scope.desarrollo.mapa_url = data.mapa_url || '';
                $scope.desarrollo.amenidades = data.amenidades || [];

                $scope.prepareMap(data);
                $scope.desarrollo.video = $scope.extractYoutubeId(data.video);

                if (Array.isArray(data.unidades)) {
                    $scope.setUnits(data.unidades);
                } else {
                    $scope.getUnidades(data.id);
                }

                if ($scope.desarrollo.svg) {
                    $scope.renderSvg($scope.desarrollo.svg);
                }

                $scope.getGaleria(data.id);
            }, function errorCallback(error) {
                console.log(error);
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('No fue posible cargar la información del desarrollo.')
                        .position('bottom right')
                        .hideDelay(4000)
                );
            });
        };

        $scope.extractYoutubeId = function(video) {
            if (!video) return '';

            var match = video.match(/(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([^&#?/]+)/);
            return match && match[1] ? match[1] : video;
        };

        $scope.prepareMap = function(data) {
            var rawUrl = String(data.mapa_url || '').trim();
            var embedUrl = '';
            var externalUrl = rawUrl;
            var iframeMatch;
            var coordinateMatch;
            var locationQuery;

            // También acepta que desde el administrador se pegue el iframe completo.
            if (rawUrl.indexOf('<iframe') !== -1) {
                iframeMatch = rawUrl.match(/src=["']([^"']+)["']/i);
                rawUrl = iframeMatch && iframeMatch[1] ? iframeMatch[1] : '';
                externalUrl = rawUrl;
            }

            // La URL de inserción de Google Maps se utiliza directamente.
            if (/google\.[^/]+\/maps\/embed/i.test(rawUrl) || /google\.com\/maps\/embed/i.test(rawUrl)) {
                embedUrl = rawUrl;
            }

            // Si el enlace contiene coordenadas, se crea un iframe compatible.
            if (!embedUrl && rawUrl) {
                coordinateMatch = rawUrl.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);

                if (!coordinateMatch) {
                    coordinateMatch = rawUrl.match(/[?&](?:q|query)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
                }

                if (coordinateMatch) {
                    locationQuery = coordinateMatch[1] + ',' + coordinateMatch[2];
                    embedUrl = 'https://www.google.com/maps?q=' + encodeURIComponent(locationQuery) + '&output=embed';
                }
            }

            // Para enlaces cortos o enlaces normales se usa la dirección capturada.
            if (!embedUrl) {
                locationQuery = data.direccion || data.ubicacion_completa || [data.zona, data.ciudad, data.estado]
                    .filter(function(value) { return !!value; })
                    .join(', ') || data.ubicacion || '';

                if (locationQuery) {
                    embedUrl = 'https://www.google.com/maps?q=' + encodeURIComponent(locationQuery) + '&output=embed';
                }
            }

            if (!externalUrl && locationQuery) {
                externalUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(locationQuery);
            }

            $scope.mapExternalUrl = externalUrl;
            $scope.mapFrame = embedUrl ? $sce.trustAsResourceUrl(embedUrl) : null;
        };

        $scope.getGaleria = function(idDesarrollo) {
            if (!idDesarrollo) return;

            Desarrollo.getGaleria(idDesarrollo).then(function successCallback(response) {
                if (response.data && response.data.id !== undefined) {
                    $scope.galeria = response.data;
                }
            }, function errorCallback(error) {
                console.log(error);
            });
        };

        $scope.scrollGallery = function(direction) {
            var track = document.getElementById('tdd-gallery-track');
            var amount;

            if (!track) return;

            amount = Math.max(Math.round(track.clientWidth * 0.82), 280) * direction;

            if (typeof track.scrollBy === 'function') {
                track.scrollBy({ left: amount, behavior: 'smooth' });
            } else {
                track.scrollLeft += amount;
            }
        };

        $scope.getUnidades = function(idDesarrollo) {
            if (!idDesarrollo) return;

            Desarrollo.getUnidades(idDesarrollo).then(function successCallback(response) {
                $scope.setUnits(response.data || []);
            }, function errorCallback(error) {
                console.log(error);
            });
        };

        $scope.setUnits = function(units) {
            $scope.unidades = units || [];
            $scope.unidadesDisponibles = $scope.unidades.filter(function(unit) {
                return parseInt(unit.estatus, 10) === 2;
            });

            if (!$scope.desarrollo.total_unidades) {
                $scope.desarrollo.total_unidades = $scope.unidades.length;
            }

            if (!$scope.desarrollo.unidades_disponibles) {
                $scope.desarrollo.unidades_disponibles = $scope.unidadesDisponibles.length;
            }

            if ($scope.desarrollo.svg) {
                setTimeout(function() {
                    $scope.addSvgAttributes();
                }, 500);
            }
        };

        $scope.renderSvg = function(svg) {
            $scope.detailFrame = $sce.trustAsResourceUrl(svg);

            setTimeout(function() {
                var container = document.getElementById('contSVG');
                if (container) {
                    container.innerHTML = "<object name='iframe1' id='iframe1' data='" + svg + "' width='100%'></object>";
                }
            }, 0);
        };

        $scope.addSvgAttributes = function() {
            var frame = $('#iframe1');
            if (!frame.length || !frame.contents()) return;

            frame.contents().find('g:not(:first)').each(function() {
                $scope.addColorFunction($(this));
            });

            frame.contents().find('g:not(:first)').off('click.triton').on('click.triton', function(event) {
                $scope.clickSvgElem(event, $(this));
            });
        };

        $scope.addColorFunction = function(elem) {
            var key = elem.attr('id');
            var unit = $scope.unidades.find(function(item) { return item.clave == key; });

            if (!unit) return;

            var status = parseInt(unit.estatus, 10);
            var style = status === 0 ? 'fill: #b7b3b3;' : status === 1 ? 'fill: #F9AF1B;' : 'fill: #4bbf78;';
            elem.find('path').attr('style', style);

            if (status === 2) {
                elem.attr('style', 'cursor: pointer;');
            }
        };

        $scope.clickSvgElem = function(event, elem) {
            var key = elem.attr('id');
            var unit = $scope.unidades.find(function(item) { return item.clave == key; });

            if (unit && parseInt(unit.estatus, 10) === 2) {
                $scope.showUnidad(event, unit);
            }
        };

        $scope.unitStatusLabel = function(unit) {
            var status = parseInt(unit.estatus, 10);
            var isRent = $scope.desarrollo.tipo_operacion === 'renta';

            if (status === 2) return 'Disponible';
            if (status === 1) return isRent ? 'En negociación' : 'Apartada';
            return isRent ? 'Rentado' : 'Vendido';
        };

        $scope.operationActionLabel = function() {
            return $scope.desarrollo.tipo_operacion === 'renta'
                ? 'Solicitar información de renta'
                : 'Solicitar información de venta';
        };

        $scope.showUnidad = function(ev, data) {
            $mdDialog.show({
                templateUrl: '/partials/modals/unidad.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                escapeToClose: true,
                controller: unidadController,
                locals: { datos: data }
            });
        };

        $scope.showImagen = function(ev, data) {
            var images = $scope.galeria.imagenes;
            var index = images.indexOf(data);

            $mdDialog.show({
                templateUrl: '/partials/modals/foto.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                disableParentScroll: true,
                escapeToClose: true,
                controller: imagenController,
                locals: { data: images, index: index }
            });
        };

        $scope.regresar = function() {
            window.history.back();
        };

        $scope.getDesarrollo();

        function unidadController($scope, $mdDialog, datos) {
            $scope.unidad = datos;
        }

        function imagenController($scope, $mdDialog, data, index) {
            $scope.index = index;
            $scope.images = data;
        }
    }
]);
