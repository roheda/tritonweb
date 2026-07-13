angular.module('notasService', [])
.factory('Nota', function($http) {
    
    return {
        getNotas: function(){
            return $http.get('dashboard/getNotas');
        },
        saveNota: function(params) {
            return $http({
                method: 'post',
                headers: { 'Content-Type' : 'application/json' },
                url: 'dashboard/newNota',
                data: params
            });
        },
        updateNota: function(id, params){
            return $http({
                method: 'post',
                headers: { 'Content-Type' : 'application/json' },
                url: 'dashboard/updateNota/' + id,
                data: params
            });
        },
        notaEstatus: function(id, params){
            return $http({
                method: 'post',
                headers: { 'Content-Type' : 'application/json' },
                url: 'dashboard/notaEstatus/' + id,
                data: params
            });
        },
        deleteNota : function(id){
            return $http({
                method: 'post',
                headers: { 'Content-Type' : 'application/json' },
                url: 'dashboard/deleteNota/' + id
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