angular.module('desarrolloCtrl', ['desarrolloService'])
.controller('desarrolloController', ['$scope', '$rootScope', '$filter', '$timeout', '$location', 'Desarrollo', '$mdToast', '$sce', '$mdDialog',
	function($scope, $rootScope, $filter, $timeout, $location, Desarrollo, $mdToast, $sce, $mdDialog) {
		
		$scope.detailFrame = null;
		$scope.desarrollos = [];
		$scope.unidades = [];
		$scope.selectedDes = null;
		$scope.loadingDesarrollos = true;
		$scope.errorDesarrollos = false;
		$scope.modoEntregados = $location.path() === '/proyectos-entregados';

		$scope.esProyectoEntregado = function(desarrollo) {
			var estado = String(desarrollo.estado_comercial || '').toLowerCase();
			return estado === 'vendido' || estado === 'agotado';
		};
		
		$scope.getDesarrollos = function() {
			$scope.desarrollos = [];
			$scope.loadingDesarrollos = true;
			$scope.errorDesarrollos = false;

			Desarrollo.getDesarrollos().then(function successCallback(response) {
				var data = Array.isArray(response.data) ? response.data : [];

				for (var i = 0; i < data.length; i++) {
					var desarrollo = data[i];
					var entregado = $scope.esProyectoEntregado(desarrollo);
					var debeMostrar = $scope.modoEntregados ? entregado : !entregado;

					if (!debeMostrar) continue;

					desarrollo.descripcion = $sce.trustAsHtml(desarrollo.descripcion || '');
					desarrollo.fecha = desarrollo.fecha ? new Date(desarrollo.fecha + 'T00:00:00') : null;
					$scope.desarrollos.push(desarrollo);
				}

				if ($scope.desarrollos.length > 0) {
					$scope.selectedDes = $scope.desarrollos[0];

					if (!$scope.modoEntregados) {
						$scope.detailFrame2 = $sce.trustAsResourceUrl($scope.selectedDes.svg || '');
						$scope.getUnidades($scope.selectedDes.id);
					}
				}

				$scope.loadingDesarrollos = false;
			}, function errorCallback() {
				$scope.loadingDesarrollos = false;
				$scope.errorDesarrollos = true;
			});
	    };

		$scope.getUnidades = function(idDesarrollo) {
			if (!idDesarrollo) return;

			Desarrollo.getUnidades(idDesarrollo).then(function successCallback(response) {
				$scope.unidades = response.data || [];
			}, function errorCallback() {
				$scope.unidades = [];
			});
		};

	    $scope.selectDesarrollo = function(desarrollo) {
			if (!desarrollo) return;

			$scope.selectedDes = desarrollo;

			if (!$scope.modoEntregados) {
				$scope.getUnidades(desarrollo.id);
			}
	    };

		$scope.getDesarrollos();
	}
]);
