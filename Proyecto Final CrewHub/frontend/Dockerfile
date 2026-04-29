FROM node:22-alpine

WORKDIR /app

# Copiamos solo los archivos de dependencias primero para aprovechar el caché
COPY src/package*.json ./

RUN npm install
RUN npm install react-router-dom
RUN npm install bootstrap
RUN npm install laravel-echo pusher-js

# Copiamos el resto del código
COPY src/ ./

EXPOSE 5173

# Ejecutamos el modo desarrollo con --host para que sea accesible fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host"]