<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Galeria extends Model
{
    protected $fillable = array('idDesarrollo', 'titulo', 'slug', 'fecha', 'estatus');
    protected $table    = 'galerias';
}
