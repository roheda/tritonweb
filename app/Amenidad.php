<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Amenidad extends Model
{
	protected $fillable = array('idDesarrollo', 'descripcion', 'ruta');
	protected $table    = 'amenidades';
}
