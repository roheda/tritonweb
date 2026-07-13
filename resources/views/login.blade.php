<!DOCTYPE html>
<html class="no-js" lang="es" ng-app="login">
    <head>
        <meta charset="utf-8"/>
        <meta name="author" content="Daniel Cárdenas Arenas">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Administrador del Sitio Web</title>
        <link rel="stylesheet" href="<?php echo asset('/components/angular-material/angular-material.css')?>" />
        <link rel="stylesheet" href="<?php echo asset('/administrador/css/login.css')?>" />
    </head>
    <body ng-controller="loginCtrl" ng-cloak>
        <div class="big-image"></div>
        <div class="wrap">
            <div layout="row" resize class="cont" layout-align="start center" adapt>
                <div flex="50" layout-padding>
                    <form method="POST" action="{{ route('login') }}">
                        {{ csrf_field() }}
                        <h2 class="md-headline text-center card-h2">ADMINISTRADOR DEL SITIO WEB</h2>
                        <h4 class="main-title" align="center card-h4">INICIAR SESIÓN</h4>
                        <md-input-container layout="center" class="{{ $errors->has('email') ? 'has-error' : '' }}">
                            <label class="subtitle">Correo Electrónico</label>
                            <input name="username" name="username" ng-model="username">
                            {!! $errors->first('username', '<span class="error">:message</span>') !!}
                        </md-input-container>
                        <md-input-container layout="center" class="{{ $errors->has('message') ? 'has-error' : '' }}">
                            <label class="subtitle">Contraseña</label>
                            <input type="password" name="password" ng-model="password">
                            {!! $errors->first('password', '<span class="error">:message</span>') !!}
                        </md-input-container>
                        <div layout="row" layout-align="center start" class="cont_contraseña">
                            <div flex="50">
                                <md-checkbox aria-label="Checkbox 1" ng-model="isChecked" ng-change="setrecordar()" name="recordar">
                                    <span class="recordarme">Recordarme</span>
                                </md-checkbox>
                                <input id="checkboxRecordarCredenciales" type="checkbox" name="recordarme" style="display:none"/>
                            </div>
                            <div flex="50" class="contraseña">
                                <a href="/login/recordar">¿Olvidaste tu contraseña?</a>
                            </div>
                        </div>
                        <div layout="row" layout-align="center center">
                            <md-input-container layout-align="center center">
                                <md-button class="md-raised  button tamano" type="submit"> INICIAR SESIÓN </md-button>
                            </md-input-container>
                        </div>                        
                    </form>
                </div>
                <!-- <div flex="50">
                    <img src="./administrador/images/fondo_dashboard.png" width="350px">
                </div> -->
            </div>
        </div>    
    </div>
    <script src="<?php echo asset('/components/jquery/jquery.js') ?>"></script>
    <script src="<?php echo asset('/components/angular/angular.js')?>"></script>
    <script src="<?php echo asset('/components/angular/angular-aria.js') ?>"></script>
    <script src="<?php echo asset('/components/angular/angular-route.js') ?>"></script>
    <script src="<?php echo asset('/components/angular/angular-animate.js') ?>"></script>
    <script src="<?php echo asset('/components/angular/angular-sanitize.js') ?>"></script>
    <script src="<?php echo asset('/components/angular-material/angular-material.js') ?>"></script>
    <script src="<?php echo asset('administrador/js/applogin.js')?>"></script>
</body>
</html>