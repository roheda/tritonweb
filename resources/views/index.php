<!DOCTYPE html>
<html class="no-js" lang="es">
    <head>
        <meta charset="utf-8"/>
        <meta name="author" content="Daniel Cárdenas Arenas">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Administrador de Página Web</title>
        <link rel="shortcut icon" href="img/favicon.ico" />
        <link rel='stylesheet prefetch' href='https://netdna.bootstrapcdn.com/font-awesome/4.0.0/css/font-awesome.min.css'>
        <link rel="stylesheet" href="<?php echo asset('components/angular-material/angular-material.css'); ?>">
        <link rel="stylesheet" href="<?php echo asset('components/angular-sidenav-menu/material-menu-sidenav.css')?>"/>
        <link rel="stylesheet" href="<?php echo asset('css/fonts.css')?>"/>
        <link rel="stylesheet" href="<?php echo asset('administrador/css/index.css')?>"/>
        <link rel="stylesheet" href="<?php echo asset('administrador/css/partials.css')?>" />
        <script>
            function saliendo(){
                localStorage.clear();
            }
        </script>
    </head>
    <body layout="column" ng-app="app" ng-controller="menuController">
        <div layout="row" layout-align="center center" style="height: 100%;">
            <md-sidenav id="menuPrincipal" flex layout="column" class="md-sidenav-left md-whiteframe-z2" md-component-id="left-sidenav" md-is-locked-open="$mdMedia('gt-sm')">
                <md-toolbar layout="column" class="contLogoMenu">
                    <div class="logo-menu"></div>
                    <div class="datos nombre">{{datosUsuario.nombreCompleto}}</div>
                    <div class="datos email">{{datosUsuario.email}}</div>
                    <span flex class="text-center hora">{{ reloj | date:'h:mm:ss a' }}</span>
                </md-toolbar>
                <md-menu-sidenav>
                    <md-menu-sidenav-item ng-repeat="menu in datosUsuario.menu | orderBy:'nombre'">
                        <md-menu-sidenav-title class="itemsMenu p0">
                            <md-toogle-menu layout="row" ng-click="activeMenu($index, menu.submenu, menu.ruta)" class="without-border opcionesMenu" flex>
                                <ng-md-icon class="icono" icon="{{menu.icono}}" layout="column"></ng-md-icon>
                                <div ng-if="menu.submenu" class="nombre">
                                    <h1 flex>{{menu.nombre}}</h1>
                                </div>
                                <div ng-if="menu.ruta" class="nombre">
                                    <a ng-href="#{{menu.ruta}}">{{menu.nombre}}</a>
                                </div>
                                <div class="iconoSubmenu">
                                    <ng-md-icon ng-if="menu.submenu" icon="{{submenus[$index]}}" class="icono" layout="column"></ng-md-icon>
                                </div>
                            </md-toogle-menu>
                        </md-menu-sidenav-title>
                        <md-menu-sidenav-content class="subItems" style="background: #737171 !important;">
                            <md-menu-sidenav-subitem ng-repeat="submenu in menu.submenu" ng-click="cambiarRuta(submenu.ruta)">
                                <a class="name-view link-menu" ng-href="#{{submenu.ruta}}">{{submenu.nombre}}</a>
                            </md-menu-sidenav-subitem>
                        </md-menu-sidenav-content>
                    </md-menu-sidenav-item>
                </md-menu-sidenav>
            </md-sidenav>
            <div layout="column" flex id="contentPrinicipal">
                <md-toolbar layout="row" class="barraSuperior">
                    <div class="md-toolbar-tools">
                        <div layout="row" layout-align="space-between center" style="width: 100%;">
                            <h1 class="main-title">Desarrollos Tritón - {{seccionName == '' ? 'Inicio' : seccionName }}</h1>
                            <md-button ng-href="/dashboard/logout" ng-click="" class="btnLogout" layout="row" layout-align="end end">
                                <ng-md-icon style="fill:#fff; padding-top: 8px;" icon="logout" md-menu-align-center></ng-md-icon>
                            </md-button>
                        </div>
                    </div>
                </md-toolbar>
                <md-content layout="column" flex class="md-padding partials-content">
                    <div ng-view="" id="vistasView" adjust></div>
                    <div class="loadpanel" dx-load-panel="loadOptions"></div>
                </md-content>
            </div>
        </div>
        <div id="loadingFrame" class="text-center" style="background: #5a5a5a;">
            <div class="inner">
                <md-progress-circular class="loading" md-diameter="60px"></md-progress-circular>
                <p style ="color: #fff">Cargando</p>
            </div>
        </div>
        <script src="<?php echo asset('components/jquery/jquery.js') ?>"></script>
        <script src="<?php echo asset('components/angular/angular.js') ?>"></script>
        <script src="<?php echo asset('components/angular/angular-messages.js') ?>"></script>
        <script src="<?php echo asset('components/angular/angular-aria.js') ?>"></script>
        <script src="<?php echo asset('components/angular/angular-route.js') ?>"></script>
        <script src="<?php echo asset('components/angular/angular-animate.js') ?>"></script>
        <script src="<?php echo asset('components/angular/angular-sanitize.js') ?>"></script>
        <script src="<?php echo asset('components/angular-material/angular-material.js') ?>"></script>
        <script src="<?php echo asset('components/i18n/angular-locale_es-mx.js') ?>"></script>
        <script src="<?php echo asset('components/angular-icons/angular-material-icons.min.js')?>"></script>
        <script src="<?php echo asset('components/angular-sidenav-menu/material-menu-sidenav.min.js')?>"></script>
        <script src="<?php echo asset('components/angular-file/angular-file-upload-html5-shim.js')?>"></script>
        <script src="<?php echo asset('components/angular-file/angular-file-upload.js')?>"></script>
        <script src="<?php echo asset('components/angular-filter/angular-filter.js')?>"></script>
        <script src="<?php echo asset('components/text-angular/dist/textAngular-rangy.min.js')?>"></script>
        <script src="<?php echo asset('components/text-angular/dist/textAngular-sanitize.js')?>"></script>
        <script src="<?php echo asset('components/text-angular/dist/textAngular.min.js')?>"></script>
        <script src="<?php echo asset('components/ngstorage/ngStorage.min.js')?>"></script>
        <script src="<?php echo asset('administrador/js/app.js')?>"></script>
        <script src="<?php echo asset('administrador/js/directives.js')?>"></script>
        <script src="<?php echo asset('administrador/js/xlsx.mini.js') ?>"></script>
        <script src="<?php echo asset('administrador/js/services/ToastService.js')?>"></script>
        <script src="<?php echo asset('administrador/js/controllers/menuController.js')?>"></script>
        <script src="<?php echo asset('administrador/js/services/menuService.js')?>"></script>
        <script src="<?php echo asset('administrador/js/controllers/usuariosController.js')?>"></script>
        <script src="<?php echo asset('administrador/js/services/usuariosService.js')?>"></script>
        <script src="<?php echo asset('administrador/js/controllers/sliderController.js')?>"></script>
        <script src="<?php echo asset('administrador/js/services/sliderService.js')?>"></script>
        <script src="<?php echo asset('administrador/js/controllers/contactoController.js')?>"></script>
        <script src="<?php echo asset('administrador/js/services/contactoService.js')?>"></script>
        <script src="<?php echo asset('administrador/js/controllers/notasController.js')?>"></script>
        <script src="<?php echo asset('administrador/js/services/notasService.js')?>"></script>
        <script src="<?php echo asset('administrador/js/controllers/equipoController.js')?>"></script>
        <script src="<?php echo asset('administrador/js/services/equipoService.js')?>"></script>
        <script src="<?php echo asset('administrador/js/controllers/desarrollosController.js')?>"></script>
        <script src="<?php echo asset('administrador/js/services/desarrollosService.js')?>"></script>
        <script src="<?php echo asset('administrador/js/services/galeriasService.js')?>"></script>
        <script src="<?php echo asset('administrador/js/controllers/unidadesController.js')?>"></script>
        <script src="<?php echo asset('administrador/js/services/unidadesService.js')?>"></script>
    </body>
</html>
