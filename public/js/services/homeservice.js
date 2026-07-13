angular.module('homeService', [])
.factory('Home', function($http) {
	
	return {

		getSlider: function() {
			return $http.get('/getActiveSlider');
		},
		getTeam: function() {
			return $http.get('/getActiveEquipo');
		},
		getGalerias: function() {
			return $http.get('/getActiveGalerias');
		},
		getVideos: function() {
			return $http.get('/getActiveVideos');
		},
		sendForm: function(formData) {
			return $http({
				method: 'POST',
				url: '/sendFormContact',
				headers: { 'Content-Type' : 'application/json' },
				data: formData
			});
		}
	}
});