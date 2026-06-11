FROM node:14-slim

WORKDIR /server

RUN apt-get update && \
    apt-get install -y python make g++ iproute2 vim procps musl-dev && \
    npm install -g pm2 && \
    pm2 install pm2-server-monit && \
    pm2 update

# Instala as dependencias do SIAP
COPY package*.json ./

RUN npm install

# Copia a aplicacao para o container
COPY . .

# Compila a aplicacao
# RUN npm run compile

COPY ./compose/production/entrypoint /entrypoint
RUN sed -i 's/\r//' /entrypoint
RUN chmod +x /entrypoint

COPY ./compose/production/start /start
RUN sed -i 's/\r//' /start
RUN chmod +x /start

ENTRYPOINT ["/entrypoint"]
