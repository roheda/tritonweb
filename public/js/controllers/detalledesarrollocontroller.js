angular.module('detalleDesarrolloCtrl', ['desarrolloService', 'youtube-embed'])
.controller('detalleDesarrolloController', ['$scope', '$rootScope', '$routeParams', '$location', 'Desarrollo', '$mdDialog', '$mdToast', '$sce', '$timeout',
    function($scope, $rootScope, $routeParams, $location, Desarrollo, $mdDialog, $mdToast, $sce, $timeout) {

        var galleryTrack = null;
        var galleryScrollHandler = null;
        var galleryScrollTimer = null;
        var galleryIdleRequest = null;
        var svgObserver = null;
        var videoObserver = null;

        $scope.detailFrame = undefined;
        $scope.mapFrame = null;
        $scope.mapExternalUrl = '';
        $scope.playerVars = { autoplay: 0 };
        $scope.unidades = [];
        $scope.unidadesDisponibles = [];
        $scope.galleryLoading = false;
        $scope.galleryHasMore = false;
        $scope.galeriaVisible = [];
        $scope.galleryBatchSize = window.innerWidth <= 680 ? 3 : 6;
        $scope.videoReady = false;

        $scope.desarrollo = {
            id: null,
            idEstado: null,
            estado: '',
            nombre: '',
            descripcion: '',
            descripcion_corta: '',
            brochure: '',
            imagen: '',
            imagen_optimizada: '',
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

        $scope.optimizedImageUrl = function(path, width, quality) {
            if (!path) return '';

            var value = String(path).trim();

            if (!value || /^https?:\/\//i.test(value) || /^data:/i.test(value) || /\.svg(?:\?|$)/i.test(value)) {
                return value;
            }

            value = value.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '');

            return '/optimized-image?src=' + encodeURIComponent(value) +
                '&w=' + encodeURIComponent(width || 800) +
                '&q=' + encodeURIComponent(quality || 78);
        };

        $scope.notifyLanguageUpdate = function() {
            if (window.TritonLanguage && typeof window.TritonLanguage.refresh === 'function') {
                $timeout(function() {
                    window.TritonLanguage.refresh();
                }, 0, false);
            }
        };

        $scope.getDesarrollo = function() {
            Desarrollo.getDesarrollo($routeParams.detalle).then(function successCallback(response) {
                var data = response.data || {};
                var amenities = Array.isArray(data.amenidades) ? data.amenidades : [];

                data.imagen_optimizada = $scope.optimizedImageUrl(data.imagen, 1280, 82);
                data.amenidades = amenities.map(function(item) {
                    item.ruta_optimizada = $scope.optimizedImageUrl(item.ruta, 480, 76);
                    return item;
                });

                angular.extend($scope.desarrollo, data);
                $scope.desarrollo.descripcion = $sce.trustAsHtml(data.descripcion || '');
                $scope.desarrollo.informacion_comercial = $sce.trustAsHtml(data.informacion_comercial || '');
                $scope.desarrollo.esquema_pago = $sce.trustAsHtml(data.esquema_pago || '');
                $scope.desarrollo.fecha = data.fecha ? new Date(data.fecha + 'T00:00:00') : new Date();
                $scope.desarrollo.enlace = data.enlace || '';
                $scope.desarrollo.svg = data.svg || '';
                $scope.desarrollo.brochure = data.brochure || '';
                $scope.desarrollo.mapa_url = data.mapa_url || '';
                $scope.desarrollo.amenidades = data.amenidades;

                $scope.prepareMap(data);
                $scope.desarrollo.video = $scope.extractYoutubeId(data.video);

                if (Array.isArray(data.unidades)) {
                    $scope.setUnits(data.unidades);
                } else {
                    $scope.getUnidades(data.id);
                }

                if ($scope.desarrollo.svg) {
                    $scope.scheduleSvgRender($scope.desarrollo.svg);
                }

                if ($scope.desarrollo.video) {
                    $scope.scheduleVideoLoad();
                }

                $scope.deferGalleryLoad(data.id);
                $scope.notifyLanguageUpdate();
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
            var originalValue = String(data.mapa_url || '').trim();
            var rawUrl = originalValue;
            var embedUrl = '';
            var externalUrl = '';
            var iframeMatch;
            var coordinateMatch;
            var locationQuery = data.direccion || data.ubicacion_completa || [data.zona, data.ciudad, data.estado]
                .filter(function(value) { return !!value; })
                .join(', ') || data.ubicacion || '';

            if (rawUrl.indexOf('<iframe') !== -1) {
                iframeMatch = rawUrl.match(/src=["']([^"']+)["']/i);
                rawUrl = iframeMatch && iframeMatch[1] ? iframeMatch[1] : '';
            }

            if (rawUrl) {
                coordinateMatch = rawUrl.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
                if (!coordinateMatch) {
                    coordinateMatch = rawUrl.match(/[?&](?:q|query)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
                }

                if (coordinateMatch) {
                    locationQuery = coordinateMatch[1] + ',' + coordinateMatch[2];
                }
            }

            if (/google\.[^/]+\/maps\/embed/i.test(rawUrl) || /google\.com\/maps\/embed/i.test(rawUrl)) {
                embedUrl = rawUrl;
                externalUrl = locationQuery
                    ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(locationQuery)
                    : 'https://www.google.com/maps';
            } else {
                externalUrl = rawUrl;

                if (locationQuery) {
                    embedUrl = 'https://www.google.com/maps?q=' + encodeURIComponent(locationQuery) + '&output=embed';
                }
            }

            if (!embedUrl && locationQuery) {
                embedUrl = 'https://www.google.com/maps?q=' + encodeURIComponent(locationQuery) + '&output=embed';
            }

            if (!externalUrl && locationQuery) {
                externalUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(locationQuery);
            }

            if (/\/maps\/embed/i.test(externalUrl)) {
                externalUrl = locationQuery
                    ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(locationQuery)
                    : 'https://www.google.com/maps';
            }

            $scope.mapExternalUrl = externalUrl;
            $scope.mapFrame = embedUrl ? $sce.trustAsResourceUrl(embedUrl) : null;
        };

        $scope.deferGalleryLoad = function(idDesarrollo) {
            if (!idDesarrollo) return;

            $scope.galleryLoading = true;

            var load = function() {
                $scope.$evalAsync(function() {
                    $scope.getGaleria(idDesarrollo);
                });
            };

            if (typeof window.requestIdleCallback === 'function') {
                galleryIdleRequest = window.requestIdleCallback(load, { timeout: 700 });
            } else {
                galleryIdleRequest = $timeout(load, 140, false);
            }
        };

        $scope.getGaleria = function(idDesarrollo) {
            if (!idDesarrollo) return;

            Desarrollo.getGaleria(idDesarrollo).then(function successCallback(response) {
                var images = [];

                if (response.data && response.data.id !== undefined) {
                    $scope.galeria = response.data;
                    images = Array.isArray(response.data.imagenes) ? response.data.imagenes : [];
                    images = images.map(function(item) {
                        item.thumb_ruta = $scope.optimizedImageUrl(item.ruta, 720, 76);
                        item.modal_ruta = $scope.optimizedImageUrl(item.ruta, 1600, 84);
                        return item;
                    });
                    $scope.galeria.imagenes = images;
                }

                $scope.galeriaVisible = images.slice(0, $scope.galleryBatchSize);
                $scope.galleryHasMore = $scope.galeriaVisible.length < images.length;
                $scope.galleryLoading = false;
                $scope.bindGalleryProgressiveLoad();
                $scope.notifyLanguageUpdate();
            }, function errorCallback(error) {
                console.log(error);
                $scope.galleryLoading = false;
            });
        };

        $scope.loadMoreGallery = function() {
            var allImages = $scope.galeria.imagenes || [];
            var start = $scope.galeriaVisible.length;
            var nextImages = allImages.slice(start, start + $scope.galleryBatchSize);

            if (!nextImages.length) {
                $scope.galleryHasMore = false;
                return false;
            }

            Array.prototype.push.apply($scope.galeriaVisible, nextImages);
            $scope.galleryHasMore = $scope.galeriaVisible.length < allImages.length;
            return true;
        };

        $scope.bindGalleryProgressiveLoad = function() {
            $timeout(function() {
                galleryTrack = document.getElementById('tdd-gallery-track');

                if (!galleryTrack || galleryScrollHandler) return;

                galleryScrollHandler = function() {
                    window.clearTimeout(galleryScrollTimer);
                    galleryScrollTimer = window.setTimeout(function() {
                        var remaining = galleryTrack.scrollWidth - galleryTrack.scrollLeft - galleryTrack.clientWidth;

                        if (remaining < galleryTrack.clientWidth * 0.75 && $scope.galleryHasMore) {
                            $scope.$applyAsync(function() {
                                $scope.loadMoreGallery();
                            });
                        }
                    }, 90);
                };

                galleryTrack.addEventListener('scroll', galleryScrollHandler, { passive: true });
            }, 0, false);
        };

        $scope.scrollGallery = function(direction) {
            var amount;

            galleryTrack = galleryTrack || document.getElementById('tdd-gallery-track');
            if (!galleryTrack) return;

            if (direction > 0 && $scope.galleryHasMore) {
                $scope.loadMoreGallery();
            }

            $timeout(function() {
                amount = Math.max(Math.round(galleryTrack.clientWidth * 0.82), 280) * direction;

                if (typeof galleryTrack.scrollBy === 'function') {
                    galleryTrack.scrollBy({ left: amount, behavior: 'smooth' });
                } else {
                    galleryTrack.scrollLeft += amount;
                }
            }, 0, false);
        };

        $scope.getUnidades = function(idDesarrollo) {
            if (!idDesarrollo) return;

            Desarrollo.getUnidades(idDesarrollo).then(function successCallback(response) {
                $scope.setUnits(response.data || []);
                $scope.notifyLanguageUpdate();
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

            if ($scope.desarrollo.svg && $scope.detailFrame) {
                $timeout(function() {
                    $scope.addSvgAttributes();
                }, 500, false);
            }
        };

        $scope.scheduleSvgRender = function(svg) {
            $timeout(function() {
                var container = document.getElementById('contSVG');

                if (!container) return;

                if (typeof window.IntersectionObserver !== 'function') {
                    $scope.renderSvg(svg);
                    return;
                }

                svgObserver = new window.IntersectionObserver(function(entries) {
                    if (!entries[0] || !entries[0].isIntersecting) return;
                    svgObserver.disconnect();
                    svgObserver = null;
                    $scope.$evalAsync(function() {
                        $scope.renderSvg(svg);
                    });
                }, { rootMargin: '320px 0px' });

                svgObserver.observe(container);
            }, 0, false);
        };

        $scope.renderSvg = function(svg) {
            $scope.detailFrame = $sce.trustAsResourceUrl(svg);

            $timeout(function() {
                var container = document.getElementById('contSVG');
                if (container) {
                    container.classList.add('is-loaded');
                    container.innerHTML = "<object name='iframe1' id='iframe1' data='" + svg + "' width='100%'></object>";

                    var object = document.getElementById('iframe1');
                    if (object) {
                        object.addEventListener('load', function() {
                            $scope.addSvgAttributes();
                        });
                    }
                }
            }, 0, false);
        };

        $scope.scheduleVideoLoad = function() {
            $timeout(function() {
                var container = document.getElementById('tdd-video-lazy');

                if (!container) return;

                if (typeof window.IntersectionObserver !== 'function') {
                    $scope.videoReady = true;
                    return;
                }

                videoObserver = new window.IntersectionObserver(function(entries) {
                    if (!entries[0] || !entries[0].isIntersecting) return;
                    videoObserver.disconnect();
                    videoObserver = null;
                    $scope.$evalAsync(function() {
                        $scope.videoReady = true;
                    });
                }, { rootMargin: '300px 0px' });

                videoObserver.observe(container);
            }, 0, false);
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

        $scope.$on('$destroy', function() {
            if (galleryTrack && galleryScrollHandler) {
                galleryTrack.removeEventListener('scroll', galleryScrollHandler);
            }

            if (typeof window.cancelIdleCallback === 'function' && galleryIdleRequest && typeof galleryIdleRequest === 'number') {
                window.cancelIdleCallback(galleryIdleRequest);
            } else if (galleryIdleRequest) {
                $timeout.cancel(galleryIdleRequest);
            }

            if (svgObserver) svgObserver.disconnect();
            if (videoObserver) videoObserver.disconnect();
            window.clearTimeout(galleryScrollTimer);
        });

        $scope.getDesarrollo();

        function unidadController($scope, $mdDialog, datos) {
            $scope.unidad = datos;
            $scope.close = function() {
                $mdDialog.cancel();
            };
        }

        function imagenController($scope, $mdDialog, data, index) {
            $scope.images = data || [];
            $scope.index = Math.max(0, Math.min(index || 0, Math.max($scope.images.length - 1, 0)));
            $scope.currentImage = $scope.images[$scope.index] || {};

            $scope.close = function() {
                $mdDialog.cancel();
            };

            $scope.move = function(direction) {
                if (!$scope.images.length) return;

                $scope.index = ($scope.index + direction + $scope.images.length) % $scope.images.length;
                $scope.currentImage = $scope.images[$scope.index];
                preloadAdjacent();
            };

            function preloadAdjacent() {
                if ($scope.images.length < 2) return;

                var nextIndex = ($scope.index + 1) % $scope.images.length;
                var previousIndex = ($scope.index - 1 + $scope.images.length) % $scope.images.length;

                [nextIndex, previousIndex].forEach(function(itemIndex) {
                    var item = $scope.images[itemIndex];
                    if (!item) return;
                    var image = new Image();
                    image.src = item.modal_ruta || item.ruta;
                });
            }

            preloadAdjacent();
        }
    }
]);
