angular.module('homeCtrl', ['homeService'])
.controller('homeController', ['$scope', '$rootScope', '$filter', '$timeout', 'Home', '$mdToast', '$sce',
	function($scope, $rootScope, $filter, $timeout, Home, $mdToast, $sce) {
		
		$scope.slider = [];
		$scope.equipo = [];

		$scope.objForm = {
			nombre: '',
			puesto: '',
			tipoPersona: 0,
			territorio: '',
			cac: '',
			correo: '',
			telefono: '',
			mensaje : ''
		};

		$scope.getSlider = function() {
			Home.getSlider().then(function successCallback(response) { 
				$scope.slider = response.data || []; 
			}, function errorCallback(error) { console.log(error); });
		};

        $scope.getTeam = function() {
            Home.getTeam().then(function successCallback(response) {
                var team = response.data || [];

                for (var i = 0; i < team.length; i++) {
                    team[i].descripcion = $sce.trustAsHtml(team[i].descripcion);
                    team[i].fecha = new Date(team[i].fecha + "T00:00:00");
                    $scope.equipo.push(team[i]);
                }
            }, function errorCallback(error) { console.log(error); });
        };

        function deferTeamLoad() {
            var load = function() {
                $scope.$evalAsync(function() {
                    $scope.getTeam();
                });
            };

            if (typeof window.requestIdleCallback === 'function') {
                window.requestIdleCallback(load, { timeout: 1800 });
            } else {
                $timeout(load, 900, false);
            }
        }

	    $scope.getSlider();
	    deferTeamLoad();
	}
])

.filter('limitHtml', function($sce) {
    return function(text, limit) {
        var changedString = String(text || '').replace(/<[^>]+>/gm, '');
		var response = changedString.length > limit ? changedString.substr(0, limit - 1) + "..." : changedString + "...";
        return $sce.trustAsHtml(response); 
    };
});
