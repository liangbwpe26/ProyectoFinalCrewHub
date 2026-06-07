<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Notification extends Model
{
    /**
     * Notificación dirigida a un usuario.
     *
     * Campos rellenables:
     * - recipient_id: ID del destinatario
     * - sender_id: ID del emisor
     * - type: tipo de notificación
     * - post_id, comment_id: referencias opcionales
     * - is_read: indicador de lectura
     *
     * Relaciones:
     * - sender(): usuario que envió la notificación
     * - post(): publicación asociada (si aplica)
     *
     * @package App\Models
     */
    protected $fillable = [
        'recipient_id', 
        'sender_id', 
        'type', 
        'post_id', 
        'comment_id',
        'is_read'
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }
}