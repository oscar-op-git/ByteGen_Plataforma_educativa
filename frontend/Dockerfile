#Usa la imagen oficial de Node.js como etapa de build
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias del frontend
COPY package*.json ./
RUN npm ci

# Copiar código fuente y config de Vite
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY public ./public
COPY src ./src

# Variables para el build, valores que se pasan en tiempo de build
ARG VITE_API_BASE_URL
ARG VITE_API_URL

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_URL=$VITE_API_URL

# Ejecutamos el build de producción
RUN npm run build

# Etapa final con Nginx, es la imagen que se usará en producción
FROM nginx:alpine

# Copiamos el build al directorio estático de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Opcional: si tu app es SPA (React Router), necesitas soportar history API.
# Descomenta si quieres un nginx.conf custom:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

#El contenedor expone el puerto 80
EXPOSE 80

# Comando para correr nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
