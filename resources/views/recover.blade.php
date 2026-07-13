<!DOCTYPE html>
<html class="no-js" lang="es" ng-app="login">
	<head>
        <meta charset="utf-8" />
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
					<form method="POST" action="{{ route('recover') }}">
						{{ csrf_field() }}
						<h2 class="md-headline text-center card-h2">ADMINISTRADOR DEL SITIO WEB</h2>
						<h4 class="main-title" align="center card-h4">RECUPERAR CONTRASEÑA</h4>
						<p align="center">Ingrese la direccion de correo electrónico asociado a la cuenta y recibira en su bandeja de correo el proceso para recuperar su contraseña.</p>
						<md-input-container class="contInput">
							<label class="tc-white">Correo Electronico</label>
							<input type="email" name="CorreoElectronico"/>
						</md-input-container>
						<div layout="row" layout-wrap layout-align="center center" class="botones">
							<div flex="50">
								<md-button class="md-raised button recover" type="submit">Enviar</md-button>
							</div>
							<div flex="50">
								<md-button ng-href="/admin" class="md-raised button recover" type="submit">Cancelar</md-button>
							</div>
						</div>
					</form>
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