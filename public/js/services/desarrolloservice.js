angular.module('desarrolloService', [])
.factory('Desarrollo', function($http) {
	
	return {
		getDesarrollos: function() {
			return $http.get('/getDesarrollos/0');
		},
		getUnidades: function(idDesarrollo) {
			return $http.get('/getUnidades/' + idDesarrollo);
		},
		getDesarrollosYucatan: function() {
			return $http.get('/getDesarrollos/31');
		},
		getDesarrollo: function(slug) {
			return $http.get('/getDesarrollo/' + slug);
		},
		getGaleria: function(param) {
            return $http.get('/getGaleria/' + param);
        },
	}
});