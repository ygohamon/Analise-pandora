# siap-redis

Aplicação que serve como camada de **cache** entre o *siap-server* e o banco de dados.

## 1. Comandos

Comando | Descrição
--------|------------
```$ ./build.sh vx.y.z``` | Cria a imagem do container
```$ docker run ---name siap-redis -p 9080:9080 -d siap-redis:vx.y.z``` | Roda o redis na porta 9080
```$ docker exec -it siap-redis redis-cli ping``` | Testa a cache
```$ docker exec -it siap-redis redis-cli flushall``` | Limpa toda a cache

## 2. Changelog

* v1.0.0 - Versão inicial da aplicação
* v1.1.0 - Atualização para Redis 5.