FROM node:14-alpine as builder

WORKDIR /app

RUN apk update && \
    apk add --no-cache python3 make g++ iputils git

# Instalacao do angular/cli para fazer o build da aplicacao
RUN npm install -g @angular/cli

# Instala as dependencias
COPY package*.json ./
COPY *.lock ./

# Parametro '--unsafe-perm' necessario para rodar o post-install
# script contido no package.json
RUN yarn install
#RUN npm install --unsafe-perm

COPY . .

COPY ./compose/local/entrypoint /entrypoint
RUN sed -i 's/\r//' /entrypoint
RUN chmod +x /entrypoint

COPY ./compose/local/start /start
RUN sed -i 's/\r//' /start
RUN chmod +x /start

ENTRYPOINT ["/entrypoint"]
