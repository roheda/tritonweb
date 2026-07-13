angular.module('contactoService', [])
.factory('Contacto', function($http) {

    return {
        getComentarios: function() {
            return $http.get('/dashboard/getComentarios');
        },
        deleteComentario: function(id) {
            return $http({
                method: 'post',
                headers: { 'Content-Type': 'application/json'},
                url: 'dashboard/deleteComentario/' + id,
                data: {}
            });
        },
    };
});
