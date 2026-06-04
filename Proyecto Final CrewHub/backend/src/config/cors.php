<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'user'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://34.206.221.208:5173',
        'http://crewhub.es:5173',
        'http://www.crewhub.es:5173',
        'http://crewhub.es',
        'https://crewhub.es:5173',
        'https://www.crewhub.es:5173',
        'https://34.206.221.208:5173',
        'https://crewhub.es'
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];