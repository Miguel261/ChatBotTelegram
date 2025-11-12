FROM node:18-slim

WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias (sin dev)
RUN npm install --omit=dev && npm list --depth=0

# Copiar el resto del código
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "main.js"]