# =========================
# Etapa de build
# =========================
FROM node:20-alpine AS build

# Crear directorio de trabajo
WORKDIR /app

# Instalar dependencias (solo usando package.json y package-lock.json)
COPY package*.json ./
RUN npm ci

# Copiar Prisma para generar el cliente
COPY prisma ./prisma
RUN npx prisma generate

# Copiar código TS y config de TypeScript
COPY tsconfig.json ./
COPY src ./src

# Compilar TypeScript a JS (salida en dist/)
RUN npm run build

# =========================
# Etapa de runtime
# =========================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copiamos package.json para instalar solo deps de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiamos el build y el cliente de Prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Si necesitas prisma/schema para futuras migraciones, puedes copiarlo también:
COPY prisma ./prisma

# IMPORTANTE: Cloud Run define PORT, tu app ya la lee desde env.PORT
# En env.ts, PORT usa process.env.PORT, así que todo ok.

CMD ["node", "dist/index.js"]
