<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Community extends Model
{
    use HasFactory;
    /**
     * Conexión de base de datos a utilizar (MongoDB).
     *
     * @var string
     */
    protected $connection = 'mongodb';

    /**
     * Nombre de la colección en MongoDB donde se almacenan las comunidades.
     *
     * @var string
     */
    protected $collection = 'communities';

    /**
     * Atributos asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'banner_path',
        'creator_id',
        'members',
        'admins',
        'require_post_approval',
        'tags',
        'rules',
        'avatar_path',
    ];

    /**
     * Valores por defecto para nuevos modelos.
     *
     * members y admins se inicializan como arrays vacíos serializados,
     * require_post_approval por defecto es true.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'members' => '[]',
        'admins' => '[]',
        'require_post_approval' => true,
        'tags' => '[]',
    ];

    /**
     * Definición de casting de atributos para Eloquent.
     *
     * Nota: usando el método "casts" en lugar de la propiedad $casts.
     * Devuelve un array con los tipos para cada atributo.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'members' => 'array',
            'admins' => 'array',
            'require_post_approval' => 'boolean',
            'tags' => 'array',
        ];
    }
}