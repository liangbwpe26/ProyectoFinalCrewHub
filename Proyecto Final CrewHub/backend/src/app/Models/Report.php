<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Report extends Model
{
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