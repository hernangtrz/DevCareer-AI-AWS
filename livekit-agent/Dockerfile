# ──────────────────────────────────────────────────────────────────────────────
# LiveKit Voice Agent — Dockerfile
# Worker sin puertos expuestos: solo conecta hacia LiveKit Cloud y APIs externas
# ──────────────────────────────────────────────────────────────────────────────
FROM node:22-slim

WORKDIR /app

# Copiar manifiestos e instalar dependencias primero (capa cacheada)
COPY package.json package-lock.json ./
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# El agente no expone ningún puerto HTTP (es un worker saliente)
# Variables de entorno se inyectan en tiempo de ejecución por ECS
CMD ["npm", "run", "start"]
