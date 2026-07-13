<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Unidad extends Model
{
	protected $fillable = array('idDesarrollo', 'clave', 'descripcion', 'brochure', 'imagen', 'tipo', 'estatus', 'largo', 'ancho', 'construccion', 'terreno', 'equipamiento', 'precio', 'precio24', 'precio48', 'precio60', 'precio72');
	protected $table    = 'unidades';
}
