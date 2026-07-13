angular.module('yucatanCtrl', ['notasService'])
.controller('yucatanController', ['$scope', '$rootScope', '$filter', '$timeout', 'Nota', '$mdToast', '$sce', '$mdDialog',
function($scope, $rootScope, $filter, $timeout, Nota, $mdToast, $sce, $mdDialog) {

		$scope.notas     = [];
		$scope.categoria = "Inicio";

		$scope.categorias = [
			{
				id: 0,
				titulo: 'Inicio',
			},
			{
				id: 1,
				titulo: 'Recomendaciones',
			},
			{
				id: 2,
				titulo: 'Estilo de vida',
			},
			{
				id: 3,
				titulo: 'Recientes',
			},
			{
				id: 4,
				titulo: 'Cerca de Mérida',
			},
			{
				id: 5,
				titulo: 'Ventas',
			},
		];

		// Devuelve las notaa
		$scope.getNotas = function() {

			Nota.get($scope.categoria).then(function successCallback(response) { 

				$scope.notas = [];

				console.log(response.data);

				for (var i = 0; i < response.data.length; i++) {
                    
                    response.data[i].descripcion = $sce.trustAsHtml(response.data[i].descripcion);
                    response.data[i].fecha       = new Date(response.data[i].fecha + "T00:00:00");

                    $scope.notas.push(response.data[i]);
                }
                
			}, function errorCallback(error) { console.log(error); });
	    };

		// Devuelve las notaa
		$scope.selectCategoria = function(categoria) {

			$scope.categoria = categoria;
			$scope.getNotas();	
	    };

		$scope.getNotas();	
		
	}
])
.filter('limitHtml', function() {
    return function(text, limit) {

        var changedString = String(text).replace(/<[^>]+>/gm, '');
        var length = changedString.length;

        return changedString.length > limit ? changedString.substr(0, limit - 1) + "..." : changedString + "..."; 
    }
})