# CrewHub

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

**CrewHub** es una red social moderna orientada al contenido multimedia y la gestión de comunidades. Desarrollada con una arquitectura de separación de responsabilidades (Frontend SPA + API REST), la plataforma integra herramientas de moderación, cuentas comerciales (Business) y consumo de vídeo de formato corto (Drops) en un entorno inmersivo.

## Características Principales

- Interacción Social: Feed dinámico con publicaciones, comentarios, likes y opciones de guardado/repost.
- Drops (Contenido Inmersivo): Reproductor de vídeo vertical a pantalla completa con scroll infinito, similar a estándares actuales.
- Comunidades: Espacios temáticos con administración delegada y moderación local.
- WebSockets en Tiempo Real: Sistema de notificaciones instantáneas y mensajería privada (Chat) sin recargas de página.
- Cuentas Business: Perfiles comerciales con herramientas de monetización y posicionamiento de Ads intercalados.
- Almacenamiento en la Nube: Integración con AWS S3 para la gestión eficiente de recursos multimedia.

## Tecnologías Utilizadas

### Frontend

- React (Vite): Interfaz de usuario de alto rendimiento.
- React Router DOM: Enrutamiento y navegación SPA.
- Context API / Custom Hooks: Gestión de estado global (autenticación, alertas).
- Tailwind CSS / CSS Nativo: Diseño "Dark Mode First" responsivo y Glassmorphism.
- Laravel Echo & Pusher-js: Cliente para comunicación en tiempo real (WebSockets).

### Backend

- Laravel 11: Framework base para la API REST.
- Laravel Sanctum: Autenticación segura mediante tokens (Bearer).
- Laravel Reverb: Servidor nativo de WebSockets para eventos en tiempo real.
- MongoDB Laravel: Integración del driver de MongoDB con Eloquent ORM.
- AWS SDK (Flysystem): Gestión de subidas de archivos a la nube.

### Infraestructura

- MongoDB Atlas: Almacenamiento de datos NoSQL.
- Docker & Docker Compose: Contenerización y orquestación del entorno de desarrollo.

## Configuración y Despliegue

### Requisitos Previos

Asegúrate de tener instalados los siguientes servicios en tu máquina local:

- Docker y Docker Compose
- Node.js (v18 o superior)

### 1. Configuración del Backend (Laravel)

Accede al directorio del backend:

```bash
cd backend
```

Duplica el archivo de entorno y configúralo:

```bash
cp .env.example .env
```

Abre el archivo `.env` y configura las variables principales:

```env
# Base de Datos (MongoDB)
DB_CONNECTION=mongodb
DB_HOST=mongodb
DB_PORT=27017
DB_DATABASE=social_db

# WebSockets (Laravel Reverb)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=tu_app_id
REVERB_APP_KEY=tu_app_key
REVERB_APP_SECRET=tu_app_secret
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=http

# AWS S3 (Opcional - Configurar según entorno)
AWS_ACCESS_KEY_ID=tu_clave
AWS_SECRET_ACCESS_KEY=tu_secreto
AWS_DEFAULT_REGION=tu_region
AWS_BUCKET=tu_bucket
```

Levanta los contenedores de Docker:

```bash
docker compose up -d
```

Instala las dependencias y genera la clave de la aplicación:

```bash
docker exec -it social_backend composer install
docker exec -it social_backend php artisan key:generate
```

Inicia el servidor de WebSockets (terminal dedicada):

```bash
docker exec -it social_backend php artisan reverb:start --host="0.0.0.0" --port=8080
```

### 2. Configuración del Frontend (React)

Abre una nueva terminal y accede al directorio del frontend:

```bash
cd frontend
```

Instala las dependencias del proyecto:

```bash
npm install
```

Crea el archivo de variables de entorno:

```bash
cp .env.example .env
```

Asegúrate de que las credenciales coincidan con las del backend:

```env
VITE_BACKEND_URL=http://localhost:8000
VITE_REVERB_APP_KEY=tu_app_key_del_backend
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```