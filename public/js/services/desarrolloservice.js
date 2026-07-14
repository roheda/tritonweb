angular.module('desarrolloService', [])
.factory('Desarrollo', function($http) {
	
	return {
		getDesarrollos: function() {
			return $http.get('/getDesarrollos/0', { cache: true });
		},
		getUnidades: function(idDesarrollo) {
			return $http.get('/getUnidades/' + idDesarrollo, { cache: true });
		},
		getDesarrollosYucatan: function() {
			return $http.get('/getDesarrollos/31', { cache: true });
		},
		getDesarrollo: function(slug) {
			return $http.get('/getDesarrollo/' + slug, { cache: true });
		},
		getGaleria: function(param) {
            return $http.get('/getGaleria/' + param, { cache: true });
        }
	};
});
