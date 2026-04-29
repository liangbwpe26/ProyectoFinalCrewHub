# Crew Hub

## Tecnologías Utilizadas

### Frontend
- React (Vite): Interfaz de usuario.
- React Router DOM: Navegación SPA.
- Context API: Gestión de estado global (autenticación y sesión).
- Laravel Echo & Pusher-js: Comunicación en tiempo real (WebSockets).
- CSS nativo: Diseño en modo oscuro con Flexbox.

### Backend
- Laravel 11: API y lógica del servidor.
- Laravel Sanctum: Autenticación mediante tokens.
- Laravel Reverb: WebSockets nativos.
- MongoDB Laravel: Integración de Eloquent con NoSQL.

### Infraestructura y Base de Datos
- MongoDB: Almacenamiento de datos.
- Docker y Docker Compose: Contenerización de servicios.

---

## Configuración del Proyecto

### Requisitos Previos
- Docker y Docker Compose instalados  
- Node.js instalado  

---

## 1. Configuración del Backend (Laravel)

### Acceder al backend
```bash
cd backend
```

### Configurar variables de entorno
```bash
cp .env.example .env
```

Editar el archivo `.env`:

```env
# Base de Datos
DB_CONNECTION=mongodb
DB_HOST=mongodb
DB_PORT=27017
DB_DATABASE=social_db

# Tiempo Real (Reverb)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=tu_app_id
REVERB_APP_KEY=tu_app_key
REVERB_APP_SECRET=tu_app_secret
REVERB_HOST="0.0.0.0"
REVERB_PORT=8080
REVERB_SCHEME=http
```

### Levantar contenedores
```bash
docker compose up -d
```

### Instalar dependencias y generar clave
```bash
docker exec -it social_backend composer install
docker exec -it social_backend php artisan key:generate
```

### Iniciar WebSockets (importante)
```bash
docker exec -it social_backend php artisan reverb:start --host="0.0.0.0" --port=8080
```

---

## 2. Configuración del Frontend (React)

### Acceder al frontend
```bash
cd frontend
```

### Instalar dependencias
```bash
npm install
```

### Crear archivo `.env`
```env
VITE_REVERB_APP_KEY=tu_app_key_del_backend
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

### Ejecutar aplicación
```bash
npm run dev
```

---

## Notas Finales

- Asegúrate de que el backend esté corriendo antes de iniciar el frontend.  
- El servidor de WebSockets (Reverb) debe estar activo para el chat en tiempo real.  
- Si ocurre algún error, revisar los logs:

```bash
docker logs social_backend
```

---

## Licencia

Este proyecto es de uso educativo y puede adaptarse según tus necesidades.