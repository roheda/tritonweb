angular.module('yucatanCtrl', ['notasService'])
.controller('yucatanController', ['$scope', '$rootScope', '$filter', '$timeout', 'Nota', '$mdToast', '$sce', '$mdDialog',
function($scope, $rootScope, $filter, $timeout, Nota, $mdToast, $sce, $mdDialog) {

    $scope.notas = [];
    $scope.categoria = 'Inicio';
    $scope.loadingNotas = false;

    $scope.categorias = [
        { id: 0, titulo: 'Inicio' },
        { id: 1, titulo: 'Recomendaciones' },
        { id: 2, titulo: 'Estilo de vida' },
        { id: 3, titulo: 'Recientes' },
        { id: 4, titulo: 'Cerca de Mérida' },
        { id: 5, titulo: 'Ventas' }
    ];

    $scope.getNotas = function() {
        $scope.loadingNotas = true;

        Nota.get($scope.categoria).then(function successCallback(response) {
            $scope.notas = [];

            angular.forEach(response.data || [], function(item) {
                item.descripcion = $sce.trustAsHtml(item.descripcion || '');
                item.fecha = item.fecha ? new Date(item.fecha + 'T00:00:00') : new Date();
                $scope.notas.push(item);
            });
        }, function errorCallback() {
            $mdToast.show(
                $mdToast.simple()
                    .textContent('No fue posible cargar los artículos.')
                    .position('bottom right')
                    .hideDelay(4000)
            );
        }).finally(function() {
            $scope.loadingNotas = false;
        });
    };

    $scope.selectCategoria = function(categoria) {
        if ($scope.categoria === categoria && $scope.notas.length) {
            return;
        }

        $scope.categoria = categoria;
        $scope.getNotas();
    };

    $scope.getNotas();
}])
.filter('limitHtml', function() {
    return function(text, limit) {
        var changedString = String(text || '')
            .replace(/<[^>]+>/gm, ' ')
            .replace(/&nbsp;|&#160;/gi, ' ')
            .replace(/&[a-z0-9#]+;/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (!changedString) {
            return '';
        }

        if (changedString.length <= limit) {
            return changedString;
        }

        return changedString.substr(0, limit).replace(/\s+\S*$/, '') + '…';
    };
});
