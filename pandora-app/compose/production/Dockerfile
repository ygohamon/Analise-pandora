FROM node:14-alpine as builder

WORKDIR /home/app

RUN apk update && \
    apk add --no-cache python3 make g++ iputils

# Instalacao do angular/cli para fazer o build da aplicacao
RUN npm install -g @angular/cli

# Instala as dependencias
COPY package*.json ./
COPY *.lock ./

# Parametro '--unsafe-perm' necessario para rodar o post-install
# script contido no package.json
RUN yarn install --unsafe-perm

# Copia a aplicacao para o container
COPY . .
# COPY src ./src
# COPY scripts ./scripts
# COPY angular.json .
# COPY ngsw-config.json .
# COPY tsconfig.json .
# COPY tslint.json .

ARG FORCE_BUILD_ENV=1
ARG ENV_BUILD=0

# Gera os arquivos environment.ts
RUN export $(grep -v '^#' .envs/.production/app.env | xargs) && \
    npm run build:env && \
    ls -lah && \
    cat ./src/environments/environment.ts && \
    cat ./src/environments/environment.prod.ts

# Compila a aplicação e exporta na pasta 'dist'
CMD ["ng", "build", "--prod", "--outputPath=dist"]
