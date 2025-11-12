# Imagen base oficial de Node.js
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del código
COPY . .

# Variables de entorno
ENV NODE_ENV=production

# Puerto opcional (por si el bot expone algo más adelante)
EXPOSE 3000

# Comando por defecto al iniciar el contenedor
CMD ["node", "main.js"]
