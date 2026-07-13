angular.module('usuariosService', [])
.factory('Usuario', function($http) {

    return {
        getUsuarios: function(params) {
            return $http.get('dashboard/getUsuarios');
        },
        getRoles: function (params) {
            return $http.get('dashboard/getAllRoles');
        },
        getPermisos: function(params) {
            return $http.get('dashboard/getPermisos');
        },
        getPermisosAll: function(params) {
            return $http.get('dashboard/Permisos');
        },
        deletePaquete: function(params) {
            return $http.get('dashboard/deleteUser/' + params);
        },
        saveUsuario: function(params) {
            return $http({
                method: 'POST',
                url: 'dashboard/saveUsuario',
                headers: { 'Content-Type': 'application/json'},
                data: params
            });
        },
        updateUsuario: function(id, params) {
            return $http({
                method: 'POST',
                url: 'dashboard/updateUsuario/' + id,
                headers: { 'Content-Type': 'application/json'},
                data: params
            });
        },
        deleteUsuario : function(id) {
            return $http({
                method: 'post',
                headers: { 'Content-Type' : 'application/json' },
                url: 'dashboard/deleteUsuario/' + id
            });
        },        
        actualizarPaquete: function(paqueteId, params) {
            return $http({
                method: 'POST',
                url: 'dashboard/updateUser/' + paqueteId,
                headers: { 'Content-Type': 'application/json' },
                data: params
            });
        },        
        deleteFile: function(data) {
            return $http({
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                url: 'dashboard/deleteFile',
                data: data
            });
        }
    };
});
