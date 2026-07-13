<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Nota extends Model 
{
    protected $fillable = array('titulo', 'slug', 'descripcion', 'categoria', 'foto', 'fecha', 'estatus');
    protected $table    = 'notas';
}

?>