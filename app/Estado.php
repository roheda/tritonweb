<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Estado extends Model
{
    protected $fillable = array('nombre', 'estatus');
    protected $table    = 'estados';
}
