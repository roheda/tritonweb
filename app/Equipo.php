<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Equipo extends Model
{
    protected $fillable = array('nombre', 'puesto', 'foto', 'estatus');
    protected $table    = 'equipo';
}
