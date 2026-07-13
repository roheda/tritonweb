angular.module('notasCtrl', ['notasService'])
.controller('notasController', ['$scope', '$rootScope', '$location', 'Nota', '$mdToast', '$sce',
   	function($scope, $rootScope, $location, Nota, $mdToast, $sce) {

		$scope.notas = [];
        $scope.page     = 1;
        $scope.total    = 1;

		$scope.getNotas = function() {

            // Nota.get().success(function(data) {

                // for (var i = 0; i < data.length; i++) {
                //     data[i].descripcion = $sce.trustAsHtml(data[i].descripcion);
                //     data[i].fecha       = new Date(data[i].fecha);
                // }

                // $scope.notas = data;

            // });

			Nota.getPaginate().success(function(data) {

                $scope.total = data.last_page;

                for (var i = 0; i < data.data.length; i++) {
                    
                    data.data[i].descripcion = $sce.trustAsHtml(data.data[i].descripcion);
                    data.data[i].fecha       = new Date(data.data[i].fecha + "T00:00:00");

                    $scope.notas.push(data.data[i]);
                }
            });
        };

        $scope.viewMore = function() {
            $scope.page = $scope.page + 1;          
            $scope.getNotas($scope.page);
        };

        // $scope.getNotas();
        $scope.getNotas($scope.page);
  	}
])
.filter('limitHtml', function() {
    return function(text, limit) {

        var changedString = String(text).replace(/<[^>]+>/gm, '');
        var length = changedString.length;

        return changedString.length > limit ? changedString.substr(0, limit - 1) + "..." : changedString + "..."; 
    }
})