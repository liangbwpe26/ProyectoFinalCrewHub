<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public static $wrap = false;

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