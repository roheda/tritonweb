angular.module('puestosService', [])
.factory('Puesto', function($http) {
    
    return {
        getPuestos : function(){
            return $http.get('admin/getPuestos');
        },
        savePuesto: function(params) {
            return $http({
                method: 'post',
                headers: { 'Content-Type' : 'application/json' },
                url: 'admin/newPuesto',
                data: params
            });
        },
        updatePuesto: function(id,params){
            return $http({
                method: 'post',
                headers: { 'Content-Type' : 'application/json' },
                url: 'admin/updatePuesto/' + id,
                data: params
            });
        },
        puestoEstatus: function(id,params){
            return $http({
                method: 'post',
                headers: { 'Content-Type' : 'application/json' },
                url: 'admin/puestoEstatus/' + id,
                data: params
            });
        },
        deletePuesto : function(id){
            return $http({
                method: 'post',
                headers: { 'Content-Type' : 'application/json' },
                url: 'admin/deletePuesto/' + id
            });
        }
    };
});