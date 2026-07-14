angular.module('unidadesService', [])
.factory('Unidad', function($http) {
    return {
        getUnidad: function(idDesarrollo) {
            return $http.get('/dashboard/getUnidades/' + idDesarrollo);
        },
        getDesarrollos: function() {
            return $http.get('/dashboard/getActiveDesa/0');
        },
        saveUnidad: function(params) {
            return $http({
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                url: '/dashboard/newUnidad',
                data: params
            });
        },
        updateUnidad: function(id, params) {
            return $http({
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                url: '/dashboard/updateUnidad/' + id,
                data: params
            });
        },
        updateEstatus: function(id, estatus) {
            return $http({
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                url: '/dashboard/updateUnidadEstatus/' + id,
                data: { estatus: estatus }
            });
        },
        deleteUnidad: function(id) {
            return $http({
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                url: '/dashboard/deleteUnidad/' + id
            });
        },
        deleteFile: function(data) {
            return $http({
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                url: '/dashboard/deleteFile',
                data: data
            });
        }
    };
});
