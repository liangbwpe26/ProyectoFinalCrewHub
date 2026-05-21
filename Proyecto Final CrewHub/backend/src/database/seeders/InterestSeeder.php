<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Interest;

class InterestSeeder extends Seeder
{
    public function run()
    {
        $interests = [
            ['name' => 'Desarrollo Web', 'slug' => 'desarrollo-web', 'icon_name' => 'code'],
            ['name' => 'Videojuegos', 'slug' => 'videojuegos', 'icon_name' => 'gamepad'],
            ['name' => 'Música', 'slug' => 'musica', 'icon_name' => 'music'],
            ['name' => 'Deportes', 'slug' => 'deportes', 'icon_name' => 'activity'],
            ['name' => 'Cine y Series', 'slug' => 'cine-y-series', 'icon_name' => 'film'],
            ['name' => 'Arte y Diseño', 'slug' => 'arte-y-diseno', 'icon_name' => 'palette'],
            ['name' => 'Tecnología', 'slug' => 'tecnologia', 'icon_name' => 'cpu'],
            ['name' => 'Cocina', 'slug' => 'cocina', 'icon_name' => 'coffee'],
        ];

        foreach ($interests as $interest) {
            Interest::create($interest);
        }
    }
}