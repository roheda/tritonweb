angular.module('equipoService', [])
.factory('Equipo', function($http) {
    
    return {
        getEquipo : function(){
            return $http.get('dashboard/getEquipo');
        },
        saveEquipo: function(params) {
            return $http({
                method: 'post',
                headers: { 'Content-Type' : 'application/json' },
                url: 'dashboard/newEquipo',
                data: params
            });
        },
        updateEquipo: function(id, params){
            return $http({
                method: 'post',
                headers: { 'Content-Type' : 'application/json' },
                url: 'dashboard/updateEquipo/' + id,
                data: params
            });
        },
        equipoEstatus: function(id, params){
            return $http({
                method: 'post',
                headers: { 'Content-Type' : 'application/json' },
                url: 'dashboard/equipoEstatus/' + id,
                data: params
            });
        },
        deleteEquipo : function(id){
            return $http({
                method: 'post',
                headers: { 'Content-Type' : 'application/json' },
                url: 'dashboard/deleteEquipo/' + id
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