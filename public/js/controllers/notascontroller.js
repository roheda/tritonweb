angular.module('notasCtrl', ['notasService'])
.controller('notasController', ['$scope', '$rootScope', '$routeParams', '$location', 'Nota', '$mdDialog', '$mdToast', '$sce',
    function($scope, $rootScope, $routeParams, $location, Nota, $mdDialog, $mdToast, $sce) {

        $scope.nota = {
            titulo: '',
            slug: '',
            descripcion: '',
            categoria: '',
            foto: '',
            fecha: '',
            readingTime: 1
        };

        function calculateReadingTime(html) {
            var plainText = String(html || '')
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
                .replace(/<[^>]+>/g, ' ')
                .replace(/&nbsp;|&#160;/gi, ' ')
                .replace(/&[a-z0-9#]+;/gi, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            var words = plainText ? plainText.split(' ').length : 0;
            return Math.max(1, Math.ceil(words / 210));
        }

        $scope.getNota = function() {
            Nota.getNota($routeParams.nota).then(function successCallback(response) {
                var data = response.data || {};

                $scope.nota.titulo = data.titulo || '';
                $scope.nota.slug = data.slug || '';
                $scope.nota.foto = data.foto || '';
                $scope.nota.categoria = data.categoria || '';
                $scope.nota.descripcion = $sce.trustAsHtml(data.descripcion || '');
                $scope.nota.fecha = data.fecha ? new Date(data.fecha + 'T00:00:00') : new Date();
                $scope.nota.readingTime = calculateReadingTime(data.descripcion);
            }, function errorCallback(error) {
                console.log(error);
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('No fue posible cargar el artículo.')
                        .position('bottom right')
                        .hideDelay(4000)
                );
            });
        };

        $scope.regresar = function() {
            window.history.back();
        };

        $scope.getNota();
    }
]);
