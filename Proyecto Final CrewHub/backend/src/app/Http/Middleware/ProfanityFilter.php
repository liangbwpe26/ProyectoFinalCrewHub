<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ProfanityFilter
{
    /**
     * Lista de palabras prohibidas que se deben filtrar.
     *
     * @var string[]
     */
    protected $badWords = [
        'idiota', 'estupido', 'imbecil', 'basura', 'mierda', 'puta', 'cabron', ''
    ];

    /**
     * Rutas que se excluyen del filtrado de palabrotas.
     * Se admiten coincidencias con comodines (ej. api/messages/*).
     *
     * @var string[]
     */
    protected $except = [
        'api/messages/*',
        'api/chats/*'
    ];

    /**
     * Maneja la petición entrante y aplica el filtrado de palabras.
     * Solo modifica peticiones que no estén en la lista de excepciones
     * y que sean de tipo POST, PUT o PATCH.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure $next
     * @return mixed
     */
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

    /**
     * Comprueba si la petición coincide con alguna ruta excluida.
     *
     * @param  mixed $request
     * @return bool
     */
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

    /**
     * Limpia recursivamente los datos reemplazando palabras prohibidas por '***'.
     * Filtra cadenas y arrays anidados.
     *
     * @param  mixed $data
     * @return mixed
     */
    private function cleanData($data)
    {
        $palabrasValidas = array_filter($this->badWords, function($word) {
            return !empty(trim($word));
        });

        $pattern = '/\b(' . implode('|', $palabrasValidas) . ')\b/i';

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