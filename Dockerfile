# Imagen base de Node.js
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Instalar bash y utilidades básicas (opcional pero útil)
RUN apk add --no-cache bash

# Copiar dependencias primero (mejor caching)
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Variables de entorno
ENV NODE_ENV=production

EXPOSE 3000

# Comando por defecto
CMD ["node", "main.js"]
