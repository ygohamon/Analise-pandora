# pandora-app

Esta aplicação implementa todo o cliente do sistema SIAP, foi desenvolvida utilizando o framework *Angular* e a plataforma *Docker*.

## 1. Instalação

Para rodar o **pandora-app** é necessária a instalação da plataforma *Docker* junto com sua aplicação *docker-compose*.


### 1.1 Imagem compilada

Para carregar uma imagem já criada é necessário carregar o container para o registro do *Docker*.

```
    docker load -i ./pandora-app-vx.y.z.tar.gz
```

### 1.2 Gerar imagem

O primeiro passo para gerar as imagens dos containers é descompactar o código fonte do sistema *pandora-app-vx.y.z.src.tar.gz*

```
    tar -xvf pandora-app-vx.y.z.src.tar.gz
    cd pandora-app-vx.y.z.src
```

Em seguida deve ser escolhido o modo desejado, desenvolvimento ou produção.

O ambiente de **desenvolvimento** é um modo mais ágil onde as alterações no código fonte são compiladas de forma mais rápida, existe a possibilidade de debug do código fonte e diversas outras propriedades.

O ambiente de **produção** é um modo onde otimizações de desempenho, espaço e memória são aplicadas à aplicação, logo em seguida o código compilado é servido através de um servidor *Nginx*.

#### 1.2.1 Dev

Para o ambiente de desenvolvimento.

```
    docker-compose -f local.yml build
```

#### 1.2.2 Prod

Para o ambiente de produção.

```
    docker-compose -f production.yml build
```


Esses comandos irão fazer o download de todas as dependências necessárias, assim como criar a imagem do container e registrá-la no repositório interno do *Docker*.

Para verificar as imagens contidas no repositório utilize:

```
    docker image ls
```


## 2. Configuração

A configuração do sistema é feita através de variáveis de ambiente contidas nos arquivos *pandora-app.env* presentes na pasta .envs, elas definem o comportamento parametrizável da aplicação.

Faça uma cópia do aquivo *pandora-app.env.new* e renomeie para *pandora-app.env*.

```
    cp pandora-app.env.new pandora-app.env
```

## 3. Execução

Para executar a aplicação:

### 3.1 Ambiente de desenvolvimento

```
    docker-compose -f local.yml up
```

Este comando vai rodar a aplicação e disponibilizá-la no endereço `http://localhost:4200/`.

### 3.2 Ambiente de produção

```
    docker-compose -f production.yml up
```

## 4. Comandos

### 4.1 Ambiente de desenvolvimento

Comando | Descrição
--------|------------
```$ docker-compose -f local.yml run pandora-app-dev /bin/sh``` | Acessa o terminal do container

### 4.2 Ambiente de produção

Comando | Descrição
--------|------------
```$ docker-compose -f production.yml run pandora-app-producao /bin/sh``` | Acessa o terminal do container
```$ docker-compose -f production.yml run pandora-app-producao nginx -t ``` | Testa se os arquivos de configuração são válidos
```$ docker-compose -f production.yml run pandora-app-producao nginx -V ``` | Mostra versão e configurações do servidor *nginx*
```$ docker-compose -f production.yml run pandora-app-producao cat /etc/nginx/nginx.conf ``` | Mostra versão e configurações do servidor *nginx*

## 5. Changelog

* v1.2.0 - Primeira versão dockerizada da aplicação.
* v1.3.1 - Atualizações de dependências.
