FROM node:20-alpine

WORKDIR /app

# Copiamos package.json y package-lock.json (si existe)
COPY src/package*.json ./

# Instalamos todo de una sola vez leyendo el package.json
RUN npm install

# Copiamos el resto del código
COPY src/ ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]