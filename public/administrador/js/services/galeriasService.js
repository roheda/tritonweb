angular.module('galeriasService', [])
.factory('Galeria', function($http) {
    
    return {
        getGaleria: function(param) {
            return $http.get('dashboard/getGaleria/' + param);
        },
        saveGaleria: function(params) {
            return $http({
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                url: 'dashboard/newGaleria',
                data: params
            });
        },
        updateGaleria: function(id,params){
            return $http({
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                url: 'dashboard/updateGaleria/' + id,
                data: params
            });
        },
        deleteGaleria: function(id){
            return $http({
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                url: 'dashboard/deleteGaleria/' + id
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