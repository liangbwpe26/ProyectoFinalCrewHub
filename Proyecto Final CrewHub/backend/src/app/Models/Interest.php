<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Interest extends Model
{
    /**
     * Modelo de intereses que los usuarios pueden seleccionar.
     *
     * Campos:
     * - name: nombre del interés
     * - slug: identificador amigable
     * - icon_name: nombre del icono asociado
     *
     * @package App\Models
     */
    protected $connection = 'mongodb';
    protected $collection = 'interests';

    protected $fillable = [
        'name',
        'slug',
        'icon_name',
    ];
}
