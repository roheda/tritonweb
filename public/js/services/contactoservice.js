angular.module('contactoService', [])
	.factory('Contacto', function($http) {

		return {
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