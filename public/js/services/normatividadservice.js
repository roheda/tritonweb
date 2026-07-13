angular.module('normativasService', [])
.factory('Normativa', function($http) {
	return {
		get: function() {
			return $http.get('/getNormativas');
		}
	}
});