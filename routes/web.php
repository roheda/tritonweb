<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('master');
});
Route::get('/yucatan', function () {
    return view('master');
});
Route::get('/yucatan/{nota?}', function () {
    return view('master');
});
Route::get('/desarrollos', function () {
    return view('master');
});
Route::get('/desarrollos/{detalle?}', function() {
	return View::make('master');
});
Route::get('/inversion', function () {
    return view('master');
});
Route::get('/contacto', function () {
    return view('master');
});

Route::get('/login/recordar', function() {
	return View::make('recover');
})->name('recover');

// Rutas para Home
Route::get('/getActiveSlider', 'SliderController@getActiveSlider');
Route::post('/sendFormContact', 'ContactoController@newComent');

// Rutas para Desarrollos
Route::get('/getDesarrollos/{id}', 'DesarrollosController@getActiveDesarrollos');
Route::get('/getDesarrollo/{slug}', 'DesarrollosController@getDesarrolloDetail');
Route::get('/getGaleria/{id}', 'GaleriasController@getGaleria');
Route::get('/getUnidades/{id}', 'UnidadController@getActiveUnidades');

// Rutas para Equipo
Route::get('/getActiveEquipo', 'EquipoController@getActiveEquipo');

// Rutas para Multimedia
Route::get('/getActiveGalerias', 'GaleriasController@getActiveGalerias');
Route::get('/getGaleriasPag', 'GaleriasController@getGaleriasPaginate');
Route::get('/getActiveVideos', 'VideosController@getActiveVideos');
Route::get('/getVideosPag', 'VideosController@getVideosPaginate');

// Rutas para Notas
Route::get('/getNotas/{cat}', 'NotasController@getActiveNotas');
Route::get('/getNotasPag', 'NotasController@getNotasPaginate');
Route::get('/getNotaDetail/{s}','NotasController@getNotaDetail');

Route::get('/dashboard', 'Auth\LoginController@index');
Route::get('logout', 'Auth\LoginController@logout')->name('logout');
Route::post('login', 'Auth\LoginController@login')->name('login');

Route::prefix('admin')->group(function () {
	Route::get('/', 'Auth\LoginController@index');
	Route::get('/logout', 'Auth\LoginController@logout')->name('logout');
	Route::post('/login', 'Auth\LoginController@login')->name('login');
	Route::post('/login#/{ruta?}', 'Auth\LoginController@index');

	Route::get('/recordar', function() {
		return View::make('recover');
	});
});

Route::middleware(['auth'])->prefix('dashboard')->group(function() {
	Route::get('/', function() {
		return View::make('index');
	});

	Route::get('/logout', 'Auth\LoginController@logout')->name('logout');

	// Ruta de archivos
	Route::post('/uploadImagen', 'FileController@uploadImagen');
	Route::post('/uploadFile', 'FileController@uploadFile');
	Route::post('/deleteFile', 'FileController@deleteFile');

	// Rutas para el usuario logeado
	Route::get('/getPermisosMenu', 'UserController@getPermisosMenu')->name('user');
	Route::get('/getUsuarioLogeado', 'UserController@getUsuarioLogeado')->name('user');
	Route::get('/getUserPorfile', 'UserController@getUserPorfile')->name('user');
	Route::post('/updatePerfil/{id}', 'UserController@updatePerfil')->name('user');

	// Rutas de usuarios
	Route::get('/getUsuarios', 'UserController@getUsuarios');
	Route::get('/getPermisos', 'UserController@getPermisos');
	Route::post('/saveUsuario', 'UserController@saveUsuario');
	Route::post('/updateUsuario/{id}', 'UserController@update');
	Route::post('/deleteUsuario/{id}', 'UserController@deleteUsuario');

	// Rutas para Slider
	Route::get('/getSlider', 'SliderController@getSlider');
	Route::post('/newSlide', 'SliderController@newSlide');
	Route::post('/updateSlide/{id}', 'SliderController@updateSlide');
	Route::post('/deleteSlide/{id}', 'SliderController@deleteSlide');
	Route::post('/slideEstatus/{id}','SliderController@slideEstatus');

	// Rutas para Comentarios.
	Route::get('/getComentarios', 'ContactoController@getComentarios');
	Route::post('/deleteComentario/{id}', 'ContactoController@deleteComentario');

	// Rutas para Notas.
	Route::get('/getNotas', 'NotasController@getNotas');
	Route::post('/newNota', 'NotasController@newNota');
	Route::post('/updateNota/{id}', 'NotasController@updateNota');
	Route::post('/deleteNota/{id}', 'NotasController@deleteNota');
	Route::post('/notaEstatus/{id}','NotasController@notaEstatus');

	// Rutas para estados.
	Route::get('/getEstados', 'EstadosController@getEstados');

	// Rutas para Desarrollos.
	Route::get('/getDesarrollos', 'DesarrollosController@getDesarrollos');
	Route::get('/getActiveDesa/{id}', 'DesarrollosController@getActiveDesarrollos');
	Route::post('/newDesarrollo', 'DesarrollosController@newDesarrollo');
	Route::post('/updateDesarrollo/{id}', 'DesarrollosController@updateDesarrollo');
	Route::post('/deleteDesarrollo/{id}', 'DesarrollosController@deleteDesarrollo');
	Route::post('/desarrolloEstatus/{id}', 'DesarrollosController@desarrolloEstatus');

	// Rutas para Galerías.
	Route::get('/getGaleria/{id}', 'GaleriasController@getGaleria');
	Route::post('/newGaleria', 'GaleriasController@newGaleria');
	Route::post('/updateGaleria/{id}', 'GaleriasController@updateGaleria');
	Route::post('/deleteGaleria/{id}', 'GaleriasController@deleteGaleria');

	// Rutas para Equipo de trabajo.
	Route::get('/getEquipo', 'EquipoController@getEquipo');
	Route::post('/newEquipo', 'EquipoController@newEquipo');
	Route::post('/updateEquipo/{id}', 'EquipoController@updateEquipo');
	Route::post('/deleteEquipo/{id}', 'EquipoController@deleteEquipo');
	Route::post('/equipoEstatus/{id}', 'EquipoController@equipoEstatus');

	// Rutas para Unidades.
	Route::get('/getUnidades/{id}', 'UnidadController@getUnidades');
	Route::post('/newUnidad', 'UnidadController@newUnidad');
	Route::post('/updateUnidad/{id}', 'UnidadController@updateUnidad');
	Route::post('/deleteUnidad/{id}', 'UnidadController@deleteUnidad');
	Route::post('/unidadEstatus/{id}', 'UnidadController@directorioEstatus');
});
