<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Permiso;
use Hash;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     * @var array
     */
    protected $fillable = array('nombre', 'apPaterno', 'apMaterno', 'username', 'password', 'email', 'path');

    /**
     * The attributes that should be hidden for arrays.
     * @var array
     */
    protected $hidden = [ 'password', 'remember_token' ];


    /**
     * Método para encriptar el password
     */
    public function setPasswordAttribute($value) {
        $this->attributes['password'] = Hash::make($value);
    }

    /**
     * Relación con la tabla de permisos
     */
    public function permissions() {
        return $this->belongsToMany(Permiso::class)->withTimestamps();
    }

    /**
     * Método para verificar los permisos del usuario
     */
    public function hasPermissions($permissions) {
        
        // Fetch all of the users permission slugs.
        $userPermissions = array_fetch($this->permissions->toArray(), 'nombre');

        // Create an empty array to store the required permissions that the user has.
        $hasPermissions = [];

        // Loop through all of the required permissions.
        foreach ((array) $permissions as $permission) {

            // Check if the required permission is in the userPermissions array.
            if (in_array($permission, $userPermissions)) {

                // Add the permission to the array of required permissions that the user has.
                $hasPermissions[] = $permission;
            }
        }

        // If all are not required, check that the user has at least 1.
        return !empty($hasPermissions);
    }

    /**
     * Método para obtener el token
     */
    public function getRememberToken() {

        return $this->remember_token;
    }

    /**
     * Método para editar el token de usuario
     */
    public function setRememberToken($value) {
        
        $this->remember_token = $value;
    }

    /**
     * Método que devuelve el nombre del token
     */
    public function getRememberTokenName() {
        
        return 'remember_token';
    }
}
