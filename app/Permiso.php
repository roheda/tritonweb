<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\User;

class Permiso extends Model
{
	/**
	 * The database table used by the model.
	 * @var string
	 */
	protected $table = 'permisos';

	/**
	 * The attributes excluded from the model's JSON form.
	 * @var array
	 */
	protected $hidden = array();

	protected $fillable = array('nombre', 'descripcion');

	/**
	 * Relacion con el modelo de usuarios
	 */
	public function users() {

		return $this->hasMany(User::class)->withTimestamps();
	}

}
