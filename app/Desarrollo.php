<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Desarrollo extends Model
{
    protected $fillable = array('id', 'idEstado', 'nombre', 'descripcion', 'brochure', 'video', 'imagen', 'logo', 'svg', 'slug', 'enlace', 'ubicacion', 'fecha', 'estatus');
    protected $table    = 'desarrollos';
}
