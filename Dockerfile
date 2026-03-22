FROM node:20-alpine

WORKDIR /app

# Nuxt embute NUXT_PUBLIC_* em build time; precisa do ARG/ENV antes do build
ARG NUXT_PUBLIC_API_BASE=http://localhost:8000
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE

COPY package*.json ./
# Copia o código antes do npm install para o postinstall (nuxt prepare, build-icons) encontrar os arquivos
COPY . .

RUN npm install

RUN npm run build

EXPOSE 3000

ENV NITRO_PORT=3000
ENV HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]

