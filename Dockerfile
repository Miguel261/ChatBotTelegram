# ===============================
# Etapa base
# ===============================
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar y instalar dependencias primero (para aprovechar el caché de Docker)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# ===============================
# Copiar carpetas del proyecto
# ===============================
COPY flow ./flow
COPY images ./images
COPY utils ./utils

# Copiar los archivos sueltos que están en la raíz del proyecto
COPY main.js .
COPY welcome.js .
COPY .env .

# ===============================
# Configuración del entorno
# ===============================
ENV NODE_ENV=production
ENV TZ=America/Mexico_City

# Puerto opcional
EXPOSE 3000

# ===============================
# Comando por defecto
# ===============================
CMD ["node", "main.js"]
