<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class GaleriaImagen extends Model
{
    protected $fillable = array('idGaleria', 'descripcion', 'ruta');
    protected $table    = 'galerias_imagenes';
}
