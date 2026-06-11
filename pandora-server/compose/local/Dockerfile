FROM node:14-alpine

WORKDIR /server

RUN apk update && \
    apk add --no-cache python3 make g++ iputils

# Instala as dependencias
COPY package*.json ./

RUN npm install

# Copia a aplicacao para o container
COPY . .

COPY ./compose/local/entrypoint /entrypoint
RUN sed -i 's/\r//' /entrypoint
RUN chmod +x /entrypoint

COPY ./compose/local/start /start
RUN sed -i 's/\r//' /start
RUN chmod +x /start

ENTRYPOINT ["/entrypoint"]
