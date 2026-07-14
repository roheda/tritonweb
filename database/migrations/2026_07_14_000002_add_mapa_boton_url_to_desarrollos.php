<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddMapaBotonUrlToDesarrollos extends Migration
{
    public function up()
    {
        Schema::table('desarrollos', function (Blueprint $table) {
            $table->text('mapa_boton_url')->nullable()->after('mapa_url');
        });
    }

    public function down()
    {
        Schema::table('desarrollos', function (Blueprint $table) {
            $table->dropColumn('mapa_boton_url');
        });
    }
}
