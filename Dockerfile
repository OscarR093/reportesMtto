# Etapa de construcción del frontend
FROM node:20.18.0-bullseye AS frontend-build

WORKDIR /app/frontend

# Copiar archivos de configuración y dependencias
COPY frontend/package*.json ./
RUN npm ci --only=production

# Copiar código fuente
COPY frontend/ .

# Construir el frontend
RUN npm run build

# Etapa de construcción del backend
FROM node:20.18.0-bullseye AS backend-build

WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente del backend
COPY . .

# Etapa final
FROM node:20.18.0-bullseye-slim

WORKDIR /app

# Instalar dependencias necesarias para bcrypt y otras dependencias nativas
RUN apt-get update && apt-get install -y python3 python3-pip build-essential && rm -rf /var/lib/apt/lists/*

# Copiar dependencias del backend
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/package*.json ./

# Copiar archivos del backend
COPY --from=backend-build /app/server.js ./
COPY --from=backend-build /app/src ./src
COPY --from=backend-build /app/config ./config
COPY --from=backend-build /app/docker ./docker
COPY --from=backend-build /app/src/migrations ./migrations
COPY --from=backend-build /app/src/models ./models

# Copiar build del frontend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Exponer puerto
EXPOSE 3002

# Comando para migrar y luego iniciar la aplicación
CMD ["sh", "-c", "node src/database/migrate.js && node server.js"]