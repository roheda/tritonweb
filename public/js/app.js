angular.module('app', [
	'ngAnimate',
 	'ngRoute',
	'ngSanitize',
 	'ngMaterial',
 	'angular-flexslider',
	'homeCtrl',
	'yucatanCtrl',
	'notasCtrl',
	'desarrolloCtrl',
	'inversionCtrl',
	'detalleDesarrolloCtrl',
	'contactoCtrl'
])
	
.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}])

.config(['$routeProvider', '$locationProvider',
	function($routeProvider, $locationProvider) {
		
		$locationProvider.html5Mode(true);

		$routeProvider
			.when('/', {
				controller: 'homeController',
				templateUrl: 'partials/home.html'
			})
			.when('/yucatan', {
				controller: 'yucatanController',
				templateUrl: 'partials/yucatan.html'
			})
			.when('/yucatan/:nota', {
				controller: 'notasController',
				templateUrl: 'partials/notas.html'
			})
			.when('/desarrollos', {
				controller: 'desarrolloController',
				templateUrl: 'partials/desarrollo.html'
			})
			.when('/desarrollos/:detalle', {
				controller: 'detalleDesarrolloController',
				templateUrl: 'partials/detalleDesarrollo.html'
			})
			.when('/proyectos-entregados', {
				controller: 'desarrolloController',
				templateUrl: 'partials/proyectos-entregados.html'
			})
			.when('/sello-triton', {
				templateUrl: 'partials/sello-triton.html'
			})
			.when('/centro-comprador', {
				templateUrl: 'partials/centro-comprador.html'
			})
			.when('/brokers', {
				templateUrl: 'partials/brokers.html'
			})
			.when('/postventa', {
				templateUrl: 'partials/postventa.html'
			})
			.when('/inversion', {
				controller: 'inversionController',
				templateUrl: 'partials/inversion.html'
			})
			.when('/contactos', {
				controller: 'contactoController',
				templateUrl: 'partials/contacto.html'
			})
			.when('/contacto', {
				controller: 'contactoController',
				templateUrl: 'partials/contacto.html'
			})
		.otherwise({ redirectTo: '/' });
	}
])

.controller('mainController', ['$scope', '$route', '$location', '$mdSidenav',  
	function($scope, $route , $location, $mdSidenav) {

		var navigationItems = [
			{ href: '/desarrollos', label: 'Desarrollos en venta', match: '/desarrollos' },
			{ href: '/proyectos-entregados', label: 'Desarrollos entregados', match: '/proyectos-entregados' },
			{ href: '/sello-triton', label: 'Sello Triton', match: '/sello-triton' },
			{ href: '/centro-comprador', label: 'Centro comprador', match: '/centro-comprador' },
			{ href: '/yucatan', label: 'Blog', match: '/yucatan' },
			{ href: '/contacto', label: 'Contacto', match: '/contacto' }
		];

		var mobileAccessItems = [
			{ href: '/brokers', label: 'Portal para brokers', match: '/brokers' },
			{ href: '/postventa', label: 'Postventa', match: '/postventa' }
		];

		function itemIsActive(item, currentPath) {
			return currentPath === item.match || currentPath.indexOf(item.match + '/') === 0;
		}

		function renderNavigation() {
			var currentPath = $location.path();
			var desktopList = document.querySelector('.triton-main-nav ul');
			var mobileList = document.querySelector('.triton-mobile-nav-links');

			if (desktopList) {
				desktopList.innerHTML = navigationItems.map(function(item) {
					return '<li class="' + (itemIsActive(item, currentPath) ? 'active' : '') + '"><a href="' + item.href + '">' + item.label + '</a></li>';
				}).join('');
			}

			if (mobileList) {
				mobileList.innerHTML = navigationItems.concat(mobileAccessItems).map(function(item) {
					return '<a href="' + item.href + '" class="' + (itemIsActive(item, currentPath) ? 'active' : '') + '">' + item.label + '</a>';
				}).join('');

				Array.prototype.forEach.call(mobileList.querySelectorAll('a'), function(link) {
					link.addEventListener('click', function() {
						$mdSidenav('right').close();
					});
				});
			}
		}

		$scope.$on('$viewContentLoaded', function(){
			$mdSidenav('right').close();
			setTimeout(renderNavigation, 0);
		});

		$scope.$on('$routeChangeSuccess', function() {
			setTimeout(renderNavigation, 0);
		});

		$scope.active = false;
		
		$scope.toggleRight = function() {
			$mdSidenav('right').toggle();
		};

		$scope.cerrarMenu = function() {            
            $mdSidenav('right').close();
        };
	    
	    $scope.isActive = function(path) {

			if($route.current && $route.current.regexp)
				return $route.current && $route.current.regexp.test(path);

			return false;
		};

		$scope.isSegment = function(path, segment) {

            if (segment == undefined)
                segment = 1;
            
            var url = $location.path().split('/');
            
            url = url[segment];

            if ('/' + url == path)
                return true;

            return false;
        };

		setTimeout(renderNavigation, 0);
	}]
)

.directive('adjust', function($window) {
    return {
        restrict: 'A',
        scope: {
            data: '@'
        },
        link: function(scope, elem) {

            function adjust() {

                var winHeight = $window.innerHeight;

                if($window.innerWidth >= 1280)
					elem.css({ 'height': winHeight + 'px' });
				else if($window.innerWidth >= 960 && $window.innerWidth <= 1280)
					elem.css({ 'height': (winHeight * 0.70) + 'px' });
				else 
					elem.css({ 'height': 'auto' });
            }

            adjust();

            angular.element($window).bind('resize', function() {
                adjust();
            });
        }
    };
})

.directive('adjustBig', function($window) {
    return {
        restrict: 'A',
        scope: {
            data: '@'
        },
        link: function(scope, elem) {

            function adjust() {

                var winHeight = $window.innerHeight;

                if($window.innerWidth >= 1280)
					elem.css({ 'height': winHeight + 'px' });
				else 
					elem.css({ 'height': 'auto' });
            }

            adjust();

            angular.element($window).bind('resize', function() {
                adjust();
            });
        }
    };
})

.directive('adjustGoal', function($window) {
	return {
		restrict: 'A',
		scope: {
			data: '@'
		},
		link: function(scope, elem) {

			function adjust() {

				var winHeight = $window.innerHeight;
				elem.css({ 'height': winHeight + 'px' });
			}

			adjust();

			angular.element($window).bind('resize', function() {
				adjust();
			});
		}
	};
})

.directive('adjustPortadas', function($window) {
    return {
        restrict: 'A',
        scope: {
            data: '@'
        },
        link: function(scope, elem) {

            function adjust() {

                var winHeight = $window.innerHeight - 107;

                if(!elem.hasClass('slider')) {

					if($window.innerWidth >= 1280)
						elem.css({ 'height': winHeight + 'px' });
					else if($window.innerWidth >= 960 && $window.innerWidth <= 1280)
						elem.css({ 'height': (winHeight * 0.70) + 'px' });

					else 
						elem.css({ 'height': 'auto' });

				} else {

					if($window.innerWidth >= 1280)
						elem.css({ 'height': winHeight + 'px' });
					else 
						elem.css({ 'height': 'auto' });
				}
            }

            adjust();

            angular.element($window).bind('resize', function() {
                adjust();
            });
        }
    };
})

.directive('imgHeight', function($window) {
    return {
        restrict: 'A',
        scope: {
            data: '@'
        },
        link: function(scope, elem) {

            function adjust() {

            	setTimeout(function() { 

	                var ancho = elem.width();

	                elem.css({
	                    'height': ancho + 'px',
	                });

                }, 100);
            }

			adjust();

            angular.element($window).bind('resize', function() {
                adjust();
            });
        }
    };
})

.directive('imgRelativeHeight', function($window) {
	return {
		restrict: 'A',
		scope: {
			data: '@'
		},
		link: function(scope, elem) {

			function adjust() {

				setTimeout(function() { 

					var ancho = elem.height() * 0.6;

					if($window.innerWidth <= 1280)
						elem.css({ 'margin-top': '-' + ancho + 'px' });

				}, 100);
			}

			adjust();

			angular.element($window).bind('resize', function() {
				adjust();
			});
		}
	};
});
