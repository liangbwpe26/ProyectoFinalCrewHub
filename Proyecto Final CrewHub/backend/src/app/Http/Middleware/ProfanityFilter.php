<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ProfanityFilter
{
    protected $badWords = [
        'idiota', 'estupido', 'imbecil', 'basura', 'mierda', 'puta', 'cabron'
    ];
    
    protected $except = [
        'api/messages/*',
        'api/chats/*'
    ];

    public function handle(Request $request, Closure $next)
    {
        if ($this->inExceptArray($request)) {
            return $next($request);
        }

        if ($request->isMethod('POST') || $request->isMethod('PUT') || $request->isMethod('PATCH')) {
            $input = $request->all();
            $cleanInput = $this->cleanData($input);
            $request->merge($cleanInput);
        }

        return $next($request);
    }

    protected function inExceptArray($request)
    {
        foreach ($this->except as $except) {
            if ($except !== '/') {
                $except = trim($except, '/');
            }

            if ($request->fullUrlIs($except) || $request->is($except)) {
                return true;
            }
        }

        return false;
    }

    private function cleanData($data)
    {
        $pattern = '/\b(' . implode('|', $this->badWords) . ')\b/i';

        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = preg_replace($pattern, '***', $value);
            } elseif (is_array($value)) {
                $data[$key] = $this->cleanData($value);
            }
        }

        return $data;
    }
}