angular.module('menuService', [])

	.factory('Menu', function ($http) {

	    return {
	    	GetPermisosMenu: function (params) {
				return $http.get('dashboard/getPermisosMenu');
			},
	        get: function (params) {
	            return $http.get('dashboard/getPermisosByIdUser');
	        },
	        getEmpresasByIdEmpresarial: function() {
		        return $http.get('/dashboard/getEmpresasByIdEmpresarial'); 
	      	},
			EstadisticaCampoBravo : function (anio) {
				return $http.get('dashboard/EstadisticaCampoBravo/'+anio);
			},
			LotesDisponibles : function (anio) {
				return $http.get('dashboard/LotesDisponibles');
			},
			InformacionPorMes : function (anio) {
				return $http.get('dashboard/InformacionPorMes');
			},
			GetUser: function (params) {
				return $http.get('dashboard/getUserPorfile');
			},
			updatePerfil : function(id, params){
		      	return $http({
			        method: 'post',
			        headers: { 'Content-Type' : 'application/json' },
			        url: 'dashboard/updatePerfil/' + id,
			        data: params
		      	});
		    }
	    };
	});
