<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Slider extends Model
{
	protected $fillable = array('titulo', 'descripcion', 'enlace', 'foto', 'estatus');
	protected $table    = 'Slider';
}
