angular.module('app', [
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'ngMaterial',
    'ngMdIcons',
    'ngMenuSidenav',
    'ngStorage',
    'usuariosCtrl',
    'menuCtrl',
    'sliderCtrl',
    'contactoCtrl',
    'desarrollosCtrl',
    'equipoCtrl',
    'unidadesCtrl',
    'notasCtrl',
])

.config(['$httpProvider', function($httpProvider) {
        
    if (!$httpProvider.defaults.headers.get)
        $httpProvider.defaults.headers.get = {};    

    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $httpProvider.defaults.headers.get['Cache-Control']       = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma']              = 'no-cache';
}])

.config(function configure($routeProvider, $locationProvider) {

    $locationProvider.hashPrefix('');

    $routeProvider
        .when('/', {
            controller: 'menuController',
            templateUrl: '/administrador/partials/principal.html',
        })
        .when('/usuarios', {
            controller: 'usuariosController',
            templateUrl: '/administrador/partials/usuarios.html'
        })
        .when('/slider', {
            controller: 'sliderController',
            templateUrl: '/administrador/partials/slider.html'
        })
        .when('/contacto', {
            controller: 'contactoController',
            templateUrl: '/administrador/partials/contacto.html'
        })
        .when('/desarrollos', {
            controller: 'desarrollosController',
            templateUrl: '/administrador/partials/desarrollos.html'
        })
        .when('/equipo', {
            controller: 'equipoController',
            templateUrl: '/administrador/partials/equipo.html'
        })
        .when('/unidades', {
            controller: 'unidadesController',
            templateUrl: '/administrador/partials/unidades.html'
        })
        .when('/notas', {
            controller: 'notasController',
            templateUrl: '/administrador/partials/notas.html'
        })
    .otherwise({
        redirectTo: '/'
    });
})

.config(function($mdThemingProvider) {

    $mdThemingProvider.definePalette('amazingPaletteName', {
        '50': '3e9ad0',
        '100': '3383b1',
        '200': '2a6d94',
        '300': '225979',
        '400': '184058',
        '500': '002b3c',
        '600': '102b3c',
        '700': '0f2838',
        '800': '0c202d',
        '900': '08141d',
        'A100': '2196F3',
        'A200': 'ff5252',
        'A400': 'ff1744',
        'A700': 'd50000',
        'contrastDefaultColor': 'light'
    });

    $mdThemingProvider
        .theme('triton')
        .primaryPalette('orange')
        .backgroundPalette('light-blue');
})

.config(function($mdIconProvider) {
    $mdIconProvider
        .iconSet("perfil", '../images/iconos/porfile.svg', 24);
})

.directive("limiteMax", function() {
    return {
        link: function(scope, element, attributes) {

            element.on("keydown keyup", function(e) {

                var value  = element.find("input").val();
                var maximo = attributes.max;
                var code   = e.which || e.keyCode;

                var allowedKeys = [8, 9, 13, 27, 35, 36, 37, 38, 39, 46, 110, 190];

                var verif = (attributes.permiso) ? true : false;

                if (verif == true) {

                    var permiso = attributes.permiso;

                    if(permiso == 0) {

                        if(Number(value) > Number(maximo)) {
                            e.preventDefault();
                            element.find("input").val(parseInt(attributes.max));
                        }
                    }

                } else {

                    if(Number(value) > Number(maximo)) {
                        e.preventDefault();
                        element.find("input").val(parseInt(attributes.max));
                    }
                }

                if(allowedKeys.indexOf(code) > -1) {
                    return;
                }

                if((e.shiftKey || (code < 48 || code > 57)) && (code < 96 || code > 105)) {
                    e.preventDefault();
                }
            });
        }
    };
})

.directive('adjust', function($window) {
    return {
        restrict: 'A',
        scope: {
            data: '@'
        },
        link: function(scope, elem, attrs) {

            function adjust() {

                var winHeight = $window.innerHeight - 96;
                // var winHeight = $window.innerHeight - 54;

                elem.css({
                    'height': winHeight + 'px',
                });
            }

            adjust();

            angular.element($window).bind('resize', function() {
                adjust();
            })
        }
    };
})