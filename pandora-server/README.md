# siap-server

Essa aplicação implementa todo o backend do servidor *REST* do sistema *SIAP* e foi desenvolvida utilizando *NodeJS*, o framework *Express* e a plataforma *Docker*.

## 1. Instalação

Para rodar o sistema é necessária a instalação da plataforma *Docker* junto com sua aplicação *docker-compose*.

### 1.1 Imagem compilada

Para carregar uma imagem já criada é necessário carregar o container para o registro do *Docker*.

```
    docker load -i ./siap-server-vx.y.z.tar.gz
```

### 1.2 Gerar imagem

O primeiro passo para gerar as imagens dos containers é descompactar o código fonte do sistema *siap-server-vx.y.z.src.tar.gz*

```
    tar -xvf siap-server-vx.y.z.src.tar.gz
    cd siap-server-vx.y.z.src
```

#### 1.2.1 Dev

Para o ambiente de desenvolvimento.

```
    docker-compose -f local.yml build
```

#### 1.2.2 Prod

Para o ambiente de produção

```
    docker-compose -f production.yml build
```


Esses comandos irão fazer o download de todas as dependências necessárias, assim como criar a imagem do container
e registrá-la no repositório interno do *Docker*.

Para verificar as imagens contidas no repositório utilize:

```
    docker image ls
```


## 2. Configuração

A configuração do sistema é feita através de variáveis de ambiente contidas nos arquivos *siap-server.env* presentes na pasta .envs, elas definem o comportamento parametrizável do SIAP.

Faça uma cópia do aquivo *siap-server.env.new* e renomeie para *siap-server.env*.

```
    cp siap-server.env.new siap-server.env
```

## 3. Execução

### 3.1 Ambiente de desenvolvimento

Para executar a aplicação:

```
    docker-compose -f local.yml up
```

### 3.2 Ambiente de produção

```
    docker-compose -f production.yml up
```

### 3.3 Testes

Para executar os testes da aplicação:
```
   export $(grep -v '^#' api.env | xargs) && npm run test
```

## 4. Docker

### 4.1 Comandos para PM2

Command | Description
--------|------------
```$ docker exec -it <container-id> pm2 monit``` | Monitoring CPU/Usage of each process
```$ docker exec -it <container-id> pm2 list``` | Listing managed processes
```$ docker exec -it <container-id> pm2 show``` | Get more information about a process
```$ docker exec -it <container-id> pm2 reload all``` | 0sec downtime reload all applications


## 5. Changelog

* v1.2.1 - Primeira versão dockerizada da aplicação.
* v1.2.2 - Atualização do node-mssql.
* v1.3.0 - Atualização de dependências, novos scripts Docker.
* v1.3.1 - Atualização de dependências.

## 6. Links relevantes

