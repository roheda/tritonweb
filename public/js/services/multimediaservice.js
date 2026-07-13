angular.module('multimediaService', [])
.factory('Multimedia', function($http) {
	return {
		getGalerias: function() {
			return $http.get('/getActiveGalerias');
		},
		getVideos: function() {
			return $http.get('/getActiveVideos');
		},
		getGaleriasPaginate: function(page) {
			return $http.get('/getGaleriasPag?page=' + page);
		},
		getVideosPaginate: function(page) {
			return $http.get('/getVideosPag?page=' + page);
		}
	}
});