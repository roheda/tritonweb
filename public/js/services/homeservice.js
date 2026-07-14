angular.module('homeService', [])
.factory('Home', function($http) {
	
	return {

		getSlider: function() {
			return $http.get('/getActiveSlider', { cache: true });
		},
		getTeam: function() {
			return $http.get('/getActiveEquipo', { cache: true });
		},
		getGalerias: function() {
			return $http.get('/getActiveGalerias', { cache: true });
		},
		getVideos: function() {
			return $http.get('/getActiveVideos', { cache: true });
		},
		sendForm: function(formData) {
			return $http({
				method: 'POST',
				url: '/sendFormContact',
				headers: { 'Content-Type' : 'application/json' },
				data: formData
			});
		}
	};
});
