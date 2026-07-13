<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

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
}
