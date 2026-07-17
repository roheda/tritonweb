<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Desarrollo extends Model
{
    protected $fillable = array(
        'id',
        'idEstado',
        'categoria',
        'nombre',
        'descripcion',
        'descripcion_corta',
        'tipo_desarrollo',
        'tipo_operacion',
        'tipo_producto',
        'estado_comercial',
        'precio_desde',
        'precio_texto',
        'mostrar_precio',
        'etapa',
        'brochure',
        'video',
        'imagen',
        'logo',
        'svg',
        'slug',
        'enlace',
        'ubicacion',
        'zona',
        'ciudad',
        'direccion',
        'mapa_url',
        'mapa_boton_url',
        'whatsapp_activo',
        'whatsapp_numero',
        'whatsapp_mensaje',
        'informacion_comercial',
        'esquema_pago',
        'disponibilidad_texto',
        'meta_title',
        'meta_description',
        'imagen_social',
        'fecha',
        'estatus'
    );

    protected $table = 'desarrollos';

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($desarrollo) {
            if (request()->has('mapa_boton_url')) {
                $desarrollo->mapa_boton_url = request()->input('mapa_boton_url');
            }

            // Los campos se guardan desde el editor del administrador. La validación
            // de existencia evita errores si el código se despliega antes de ejecutar
            // el archivo SQL correspondiente.
            if (Schema::hasColumn('desarrollos', 'whatsapp_activo')) {
                if (request()->has('whatsapp_activo')) {
                    $desarrollo->whatsapp_activo = intval(request()->input('whatsapp_activo')) === 1 ? 1 : 0;
                }

                if (request()->has('whatsapp_numero')) {
                    $numero = preg_replace('/\D+/', '', (string) request()->input('whatsapp_numero'));
                    $desarrollo->whatsapp_numero = $numero !== '' ? $numero : null;
                }

                if (request()->has('whatsapp_mensaje')) {
                    $mensaje = trim((string) request()->input('whatsapp_mensaje'));
                    $desarrollo->whatsapp_mensaje = $mensaje !== '' ? mb_substr($mensaje, 0, 500) : null;
                }
            }
        });
    }
}
