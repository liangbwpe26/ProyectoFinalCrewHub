<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Interest;

class InterestSeeder extends Seeder
{
    public function run()
    {
        $interests = [
            // Categorías generales de ocio y estilo de vida
            ['name' => 'Estilo de Vida', 'slug' => 'estilo-de-vida', 'icon_name' => 'sun'],
            ['name' => 'Humor y Memes', 'slug' => 'humor', 'icon_name' => 'smile'],
            ['name' => 'Pensamientos y Reflexiones', 'slug' => 'pensamientos', 'icon_name' => 'message-circle'],
            ['name' => 'Actualidad y Noticias', 'slug' => 'actualidad', 'icon_name' => 'globe'],
            
            // Cultura, arte y entretenimiento
            ['name' => 'Cine y Series', 'slug' => 'cine-y-series', 'icon_name' => 'film'],
            ['name' => 'Música', 'slug' => 'musica', 'icon_name' => 'music'],
            ['name' => 'Arte y Diseño', 'slug' => 'arte-y-diseno', 'icon_name' => 'palette'],
            ['name' => 'Fotografía', 'slug' => 'fotografia', 'icon_name' => 'camera'],
            ['name' => 'Anime y Cultura Geek', 'slug' => 'anime', 'icon_name' => 'tv'],
            
            // Actividades, aficiones y desarrollo
            ['name' => 'Videojuegos', 'slug' => 'videojuegos', 'icon_name' => 'gamepad'],
            ['name' => 'Deportes', 'slug' => 'deportes-fitness', 'icon_name' => 'activity'],
            ['name' => 'Viajes y Aventura', 'slug' => 'viajes', 'icon_name' => 'map'],
            ['name' => 'Gastronomía', 'slug' => 'gastronomia', 'icon_name' => 'coffee'],
            
            // Profesionales y académicos
            ['name' => 'Tecnología', 'slug' => 'tecnologia', 'icon_name' => 'cpu'],
            ['name' => 'Educación y Aprendizaje', 'slug' => 'educacion', 'icon_name' => 'book'],
            ['name' => 'Negocios y Finanzas', 'slug' => 'negocios', 'icon_name' => 'briefcase'],

            ['name' => 'Desarrollo Web', 'slug' => 'desarrollo-web', 'icon_name' => 'code'],
            ['name' => 'Cocina', 'slug' => 'cocina', 'icon_name' => 'coffee'],
        ];

        foreach ($interests as $interest) {
            Interest::firstOrCreate(
                ['slug' => $interest['slug']], 
                $interest
            );
        }
    }
}