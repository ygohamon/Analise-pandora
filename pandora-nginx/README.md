# siap-nginx

Aplicação que serve como servidor web para o **pandora-app**.

## 1. Configuração

A configuração do nginx é feita através dos arquivos *.conf* contidos na pasta *./scripts*.
O arquivo *./scripts/conf.d/siap.https.conf* contém as configurações principais para acessar o SIAP, nela é possível configurar o *IP* da aplicação *siap-server* assim como as chaves SSL para garantir o acesso seguro ao sistema.

Por padrão o **siap-nginx** gera chaves auto-assinadas para fornecer o *https*. Se houver certificado disponível é necessário adicioná-lo ao container, alterar o arquivo de configuração correspondente e recriar a imagem.

 ```
  # Trecho a ser alterado na configuração do certificado digital

  ssl_certificate /etc/ssl/certs/private/siap.crt;
  ssl_certificate_key /etc/ssl/certs/private/siap.key;
 ```

O arquivo *siap.https.conf* configura também a cache dos arquivos estáticos (.html, .jpeg, .png, .css, etc)

 ```
  location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
    expires 30d;
  }
 ```

## 2. Comandos

Comando | Descrição
--------|------------
```$ ./build.sh vx.y.z``` | Cria a imagem do container
```$ docker run ---name siap-nginx -d siap-nginx:vx.y.z``` | Roda o redis
```$ docker exec -it siap-nginx /bin/sh ``` | Acessa o terminal do container
```$ docker exec -it siap-nginx nginx -t``` | Testa se os arquivos de configuração são válidos

## 3. Changelog

* v1.0.0 - Versão inicial da aplicação
* v1.0.1 - Alterações nos scripts de geração dos containers e criação do arquivo siap-nginx.env
* v1.0.2 - Remoção do header Server, bloqueio de alguns user agents