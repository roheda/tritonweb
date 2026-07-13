<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Comentario extends Model
{
    protected $fillable = array('nombre', 'apellido', 'is_broker', 'privacy', 'ciudad', 'pais', 'correo', 'telefono', 'medio', 'preferencia', 'mensaje');
    protected $table    = 'comentarios';
}

