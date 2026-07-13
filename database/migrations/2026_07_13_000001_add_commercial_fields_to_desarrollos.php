<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AddCommercialFieldsToDesarrollos extends Migration
{
    public function up()
    {
        DB::statement('ALTER TABLE desarrollos MODIFY descripcion TEXT NULL');

        Schema::table('desarrollos', function (Blueprint $table) {
            $table->string('descripcion_corta', 350)->nullable()->after('descripcion');
            $table->string('tipo_desarrollo', 30)->nullable()->after('descripcion_corta');
            $table->string('tipo_operacion', 20)->nullable()->after('tipo_desarrollo');
            $table->string('tipo_producto', 100)->nullable()->after('tipo_operacion');
            $table->string('estado_comercial', 40)->nullable()->after('tipo_producto');
            $table->decimal('precio_desde', 14, 2)->nullable()->after('estado_comercial');
            $table->string('precio_texto')->nullable()->after('precio_desde');
            $table->boolean('mostrar_precio')->default(true)->after('precio_texto');
            $table->string('etapa', 100)->nullable()->after('mostrar_precio');
            $table->string('zona', 150)->nullable()->after('ubicacion');
            $table->string('ciudad', 100)->nullable()->after('zona');
            $table->string('direccion')->nullable()->after('ciudad');
            $table->text('mapa_url')->nullable()->after('direccion');
            $table->text('informacion_comercial')->nullable()->after('mapa_url');
            $table->text('esquema_pago')->nullable()->after('informacion_comercial');
            $table->string('disponibilidad_texto')->nullable()->after('esquema_pago');
            $table->string('meta_title')->nullable()->after('disponibilidad_texto');
            $table->string('meta_description', 320)->nullable()->after('meta_title');
            $table->string('imagen_social')->nullable()->after('meta_description');
        });
    }

    public function down()
    {
        Schema::table('desarrollos', function (Blueprint $table) {
            $table->dropColumn([
                'descripcion_corta',
                'tipo_desarrollo',
                'tipo_operacion',
                'tipo_producto',
                'estado_comercial',
                'precio_desde',
                'precio_texto',
                'mostrar_precio',
                'etapa',
                'zona',
                'ciudad',
                'direccion',
                'mapa_url',
                'informacion_comercial',
                'esquema_pago',
                'disponibilidad_texto',
                'meta_title',
                'meta_description',
                'imagen_social'
            ]);
        });

        DB::statement('ALTER TABLE desarrollos MODIFY descripcion VARCHAR(255) NULL');
    }
}
