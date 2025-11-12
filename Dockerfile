# Imagen base oficial de Node.js
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (sin omitir devDependencies por ahora)
RUN npm install --omit=dev

# Copiar el resto del código
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "main.js"]

