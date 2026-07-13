angular.module('contactoCtrl', ['contactoService'])
.controller('contactoController', ['$scope', '$animate', 'Contacto', '$mdToast',
	function($scope, $animate, Contacto, $mdToast) {
		
	$scope.submitted = false;

$scope.objForm = {
  is_broker: null,
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
  ciudad: '',
  pais: '',
  medio: '',
  preferencia: '',
  mensaje: ''
};

$scope.send = function(params) {
  $scope.submitted = true;

  if (
    !$scope.objForm.is_broker ||
    !$scope.objForm.nombre ||
    !$scope.objForm.apellido ||
    !$scope.objForm.telefono ||
    !$scope.objForm.ciudad
  ) {
    $mdToast.show(
      $mdToast.simple()
        .textContent('Por favor completa los campos obligatorios.')
        .position('bottom right')
        .toastClass('md-warn')
    );
    return false;
  }

			fetch(
				"https://hooks.zapier.com/hooks/catch/15928337/u7v7svz/?" +
				"is_broker=" + encodeURIComponent(params.is_broker || "") +
				"&tipo_lead=" + encodeURIComponent(String(params.is_broker) === "2" ? "Broker" : "Cliente") +
				"&nombre=" + encodeURIComponent(params.nombre || "") +
				"&apellido=" + encodeURIComponent(params.apellido || "") +
				"&correo=" + encodeURIComponent(params.correo || "") +
				"&telefono=" + encodeURIComponent(params.telefono || "") +
				"&ciudad=" + encodeURIComponent(params.ciudad || "") +
				"&pais=" + encodeURIComponent(params.pais || "") +
				"&medio=" + encodeURIComponent(params.medio || "") +
				"&preferencia=" + encodeURIComponent(params.preferencia || "") +
				"&mensaje=" + encodeURIComponent(params.mensaje || "") +
				"&page_url=" + encodeURIComponent(window.location.href) +
				"&page_title=" + encodeURIComponent(document.title)
			).catch(function() {});

			Contacto.sendForm(params).then(function successCallback(response) {
				if (response.data.status == 'success') {
					$scope.submitted = false;
					$scope.objForm = {
						is_broker: null,
						nombre: '',
						apellido: '',
						correo: '',
						telefono: '',
						ciudad: '',
						pais: '',
						medio: '',
						preferencia: '',
						mensaje: ''
					};

					$mdToast.show(
						$mdToast.simple()
							.textContent('Su mensaje se envió correctamente')
							.position('bottom right')
					);

				} else {
					$mdToast.show(
						$mdToast.simple()
							.textContent(response.data.mensaje)
							.position('bottom right')
							.toastClass('md-warn')
					);
				}
			}, function errorCallback() {
				$mdToast.show(
					$mdToast.simple()
						.textContent('Error al enviar el formulario')
						.position('bottom right')
				);
			});
		};
	}
]);