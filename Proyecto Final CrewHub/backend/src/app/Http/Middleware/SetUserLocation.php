<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Torann\GeoIP\Facades\GeoIP;

class SetUserLocation
{
    public function handle(Request $request, Closure $next)
{
    try {
        $ip = app()->environment('local') ? '8.8.8.8' : $request->ip();
        $location = GeoIP::getLocation($ip);
        $request->attributes->set('country_code', $location->iso_code ?? 'XX');
    } catch (\Exception $e) {
        $request->attributes->set('country_code', 'ES'); 
    }

    return $next($request);
}
}