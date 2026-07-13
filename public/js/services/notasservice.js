angular.module('notasService', [])
.factory('Nota', function($http) {
	return {
		get: function(categotia) {
			return $http.get('/getNotas/' + categotia);
		},
		getPaginate: function(page) {
			return $http.get('/getNotasPag?page=' + page);
		},
		getNota: function(slug) {
			return $http.get('/getNotaDetail/' + slug);
		}
	}
});