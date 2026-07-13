angular.module('app')
  .service('Toast', ['$mdToast', function($mdToast) {

    this.show = function(argument,type) {
      $mdToast.show({
        template: '<md-toast class="md-toast ' + type + '"><p style="margin:0" flex>{{ toast.content }}</p></md-toast>',
        hideDelay: 5000,
        position: 'bottom right',
        controller: [function() {
          this.content = argument;
          this.resolve = function() {
            $mdToast.hide();
          };
        }],
        controllerAs: 'toast'
      });
    };

  }]);
