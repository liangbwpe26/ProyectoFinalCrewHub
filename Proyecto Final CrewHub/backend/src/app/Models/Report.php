<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Report extends Model
{
    /**
     * Informe/report de abuso u otro problema.
     *
     * Campos rellenables:
     * - reporter_id: ID del usuario que reporta
     * - reported_id: ID del usuario reportado
     * - target_type: tipo de objetivo (ej. 'post', 'comment')
     * - target_id: ID del objetivo
     * - reason: motivo del reporte
     * - details: detalles adicionales
     * - status: estado del reporte
     *
     * Relaciones:
     * - reporter(): usuario que crea el reporte
     * - reportedUser(): usuario reportado
     *
     * @package App\Models
     */
    protected $collection = 'reports';

    protected $fillable = [
        'reporter_id',
        'reported_id',
        'target_type',
        'target_id',
        'reason',
        'details',
        'status'
    ];

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function reportedUser()
    {
        return $this->belongsTo(User::class, 'reported_id');
    }
}