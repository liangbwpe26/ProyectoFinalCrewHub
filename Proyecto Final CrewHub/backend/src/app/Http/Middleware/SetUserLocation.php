<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Torann\GeoIP\Facades\GeoIP;

/**
 * Middleware para establecer la ubicación del usuario basado en su dirección IP.
 */
class SetUserLocation
{
    /**
     * Procesa la solicitud y establece el código de país del usuario.
     *
     * @param Request $request La solicitud HTTP actual
     * @param Closure $next El siguiente middleware
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            // Obtiene la dirección IP del cliente, usando Google DNS en desarrollo
            $ip = app()->environment('local') ? '8.8.8.8' : $request->ip();
            
            // Obtiene la ubicación geográfica basada en la IP
            $location = GeoIP::getLocation($ip);
            
            // Establece el código de país ISO en los atributos de la solicitud
            $request->attributes->set('country_code', $location->iso_code ?? 'XX');
        } catch (\Exception $e) {
            // En caso de error, asigna España como país por defecto
            $request->attributes->set('country_code', 'ES');
        }

        return $next($request);
    }
}