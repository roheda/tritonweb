angular.module('desarrollosService', [])
.factory('Desarrollo', function($http) {
    
    return {
        getDesarrollos: function(){
            return $http.get('dashboard/getDesarrollos');
        },
        getEstados: function(){
            return $http.get('dashboard/getEstados');
        },
        saveDesarrollo: function(params) {
            return $http({
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                url: 'dashboard/newDesarrollo',
                data: params
            });
        },
        updateDesarrollo: function(id,params){
            return $http({
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                url: 'dashboard/updateDesarrollo/' + id,
                data: params
            });
        },
        galeriaEstatus: function(id,params){
            return $http({
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                url: 'dashboard/galeriaEstatus/' + id,
                data: params
            });
        },
        deleteDesarrollo: function(id){
            return $http({
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                url: 'dashboard/deleteDesarrollo/' + id
            });
        },
        deleteFile: function(data) {
            return $http({
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                url: 'dashboard/deleteFile',
                data: data
            });
        },
    };
});