angular.module('sliderService', [])
.factory('Slide', function($http) {
	return {
		getSlides: function() {
			return $http.get('dashboard/getSlider');
		},
		newSlide: function(params) {
			return $http({
				method: 'post',
				headers: { 'Content-Type' : 'application/json' },
				url: 'dashboard/newSlide',
				data: params
			});
		},
		updateSlide: function(id, params) {
			return $http({
				method: 'post',
				headers: { 'Content-Type' : 'application/json' },
				url: 'dashboard/updateSlide/' + id,
				data: params
			});
		},
		deleteSlide: function(id) {
			return $http({
				method: 'post',
				headers: {'Content-Type': 'application/json'},
				url: 'dashboard/deleteSlide/' + id,
				data: {}
			});
		},
      	slideEstatus: function(id) {
			return $http({
				method: 'post',
				headers: { 'Content-Type' : 'application/json' },
				url: 'dashboard/slideEstatus/' + id,
				data: []
			});
		}
	}
});