# Estágio 1: Build (Compila de TS para JS)
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Produção (Roda o código compilado)
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
# Instala apenas dependências de produção (ignora o TS)
RUN npm install --production
# Copia apenas a pasta dist do estágio anterior
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3001
CMD [ "node", "dist/server.js" ]