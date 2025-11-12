FROM node:18-slim

WORKDIR /app

COPY package*.json ./

# 👇 Esta línea te dirá exactamente qué se instala
RUN npm install --omit=dev && npm list --depth=0 || cat /app/package.json

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "main.js"]
