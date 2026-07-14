<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
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
Route::get('/proyectos-entregados', function () {
    return view('master');
});
Route::get('/sello-triton', function () {
    return view('master');
});
Route::get('/centro-comprador', function () {
    return view('master');
});
Route::get('/brokers', function () {
    return view('master');
});
Route::get('/postventa', function () {
    return view('master');
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

Route::get('/optimized-image', 'FileController@optimizedImage');
Route::get('/getActiveSlider', 'SliderController@getActiveSlider');
Route::post('/sendFormContact', 'ContactoController@newComent');

Route::get('/getDesarrollos/{id}', 'DesarrollosController@getActiveDesarrollos');
Route::get('/getDesarrollo/{slug}', 'DesarrollosController@getDesarrolloDetail');
Route::get('/getGaleria/{id}', 'GaleriasController@getGaleria');
Route::get('/getUnidades/{id}', 'UnidadController@getActiveUnidades');

Route::get('/getActiveEquipo', 'EquipoController@getActiveEquipo');

Route::get('/getActiveGalerias', 'GaleriasController@getActiveGalerias');
Route::get('/getGaleriasPag', 'GaleriasController@getGaleriasPaginate');
Route::get('/getActiveVideos', 'VideosController@getActiveVideos');
Route::get('/getVideosPag', 'VideosController@getVideosPaginate');

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

    Route::post('/uploadImagen', 'FileController@uploadImagen');
    Route::post('/uploadFile', 'FileController@uploadFile');
    Route::post('/deleteFile', 'FileController@deleteFile');

    Route::get('/getPermisosMenu', 'UserController@getPermisosMenu')->name('user');
    Route::get('/getUsuarioLogeado', 'UserController@getUsuarioLogeado')->name('user');
    Route::get('/getUserPorfile', 'UserController@getUserPorfile')->name('user');
    Route::post('/updatePerfil/{id}', 'UserController@updatePerfil')->name('user');

    Route::get('/getUsuarios', 'UserController@getUsuarios');
    Route::get('/getPermisos', 'UserController@getPermisos');
    Route::post('/saveUsuario', 'UserController@saveUsuario');
    Route::post('/updateUsuario/{id}', 'UserController@update');
    Route::post('/deleteUsuario/{id}', 'UserController@deleteUsuario');

    Route::get('/getSlider', 'SliderController@getSlider');
    Route::post('/newSlide', 'SliderController@newSlide');
    Route::post('/updateSlide/{id}', 'SliderController@updateSlide');
    Route::post('/deleteSlide/{id}', 'SliderController@deleteSlide');
    Route::post('/slideEstatus/{id}','SliderController@slideEstatus');

    Route::get('/getComentarios', 'ContactoController@getComentarios');
    Route::post('/deleteComentario/{id}', 'ContactoController@deleteComentario');

    Route::get('/getNotas', 'NotasController@getNotas');
    Route::post('/newNota', 'NotasController@newNota');
    Route::post('/updateNota/{id}', 'NotasController@updateNota');
    Route::post('/deleteNota/{id}', 'NotasController@deleteNota');
    Route::post('/notaEstatus/{id}','NotasController@notaEstatus');

    Route::get('/getEstados', 'EstadosController@getEstados');

    Route::get('/getDesarrollos', 'DesarrollosController@getDesarrollos');
    Route::get('/getActiveDesa/{id}', 'DesarrollosController@getActiveDesarrollos');
    Route::post('/newDesarrollo', 'DesarrollosController@newDesarrollo');
    Route::post('/updateDesarrollo/{id}', 'DesarrollosController@updateDesarrollo');
    Route::post('/deleteDesarrollo/{id}', 'DesarrollosController@deleteDesarrollo');
    Route::post('/desarrolloEstatus/{id}', 'DesarrollosController@desarrolloEstatus');

    Route::get('/getGaleria/{id}', 'GaleriasController@getGaleria');
    Route::post('/newGaleria', 'GaleriasController@newGaleria');
    Route::post('/updateGaleria/{id}', 'GaleriasController@updateGaleria');
    Route::post('/deleteGaleria/{id}', 'GaleriasController@deleteGaleria');

    Route::get('/getEquipo', 'EquipoController@getEquipo');
    Route::post('/newEquipo', 'EquipoController@newEquipo');
    Route::post('/updateEquipo/{id}', 'EquipoController@updateEquipo');
    Route::post('/deleteEquipo/{id}', 'EquipoController@deleteEquipo');
    Route::post('/equipoEstatus/{id}', 'EquipoController@equipoEstatus');

    Route::get('/getUnidades/{id}', 'UnidadController@getUnidades');
    Route::post('/newUnidad', 'UnidadController@newUnidad');
    Route::post('/updateUnidad/{id}', 'UnidadController@updateUnidad');
    Route::post('/updateUnidadEstatus/{id}', 'UnidadController@updateEstatus');
    Route::post('/deleteUnidad/{id}', 'UnidadController@deleteUnidad');
    Route::post('/unidadEstatus/{id}', 'UnidadController@directorioEstatus');
});
