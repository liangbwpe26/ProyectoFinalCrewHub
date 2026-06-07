<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Recurso de usuario para transformar el modelo en una respuesta JSON.
 */
class UserResource extends JsonResource
{
    /**
     * Deshabilita el envoltorio automático de los recursos JSON.
     *
     * @var bool
     */
    public static $wrap = false;

    /**
     * Transforma el recurso en un arreglo para la respuesta JSON.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->_id ?? $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'display_name' => $this->display_name,
            'profile_picture' => $this->profile_picture,
            'date_of_birth' => $this->date_of_birth,
            'interests' => $this->interests,
            'is_private' => $this->is_private,
            'is_admin' => $this->is_admin,
            'privacy_messages' => $this->privacy_messages ?? 'everyone',
            'privacy_comments' => $this->privacy_comments ?? 'everyone',
            'is_business' => $this->is_business ?? false,
            'is_verified' => $this->is_verified ?? false,
            'business_category' => $this->business_category,
            'notification_prefs' => $this->notification_prefs,
        ];
    }
}