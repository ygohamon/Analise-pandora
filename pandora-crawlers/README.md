# pandora-crawler

## Requisitos

1. Docker e Docker Compose

## Como rodar

```console
$ docker-compose -f dev.yml build
$ docker-compose -f dev.yml up
```


## Comandos básicos

Pode consultar via Postman, Curl ou qualquer outro app para criar requisições HTTP


Para consultar o IP do serviço
```
 $ curl http://localhost:3123/ip
```


Para consultar o IP do TOR
```
 $ curl http://localhost:3123/tor/ip
```

Para resetar o IP TOR
```
 $ curl http://localhost:3123/tor/reset
```

## Crawlers

Existem diversos spiders:

* [yahoo](https://br.search.yahoo.com)
* [jusbrasil](https://www.jusbrasil.com.br)
* [duck](https://duckduckgo.com)
* [google](https://www.google.com.br)
* [bing](https://www.bing.com/search)
* [lukol](https://lukol.com)
* [qwant](https://www.qwant.com/)
* [startpage](https://www.startpage.com)
* all - Todos os crawlers ao mesmo tempo
* do - (qwant, bing, startpage, yahoo e lukol)
* cheerio (qwant, bing, startpage e yahoo)
  

Para consultar os crawlers usa-se a requisição:

```
 $ curl http://localhost:3123/crawl?spider=xxx&timeout=xxx&q=xxx
```

1. Escolha um spider
2. Defina um timeout para a requisição (em ms)
3. Forneça a query

Exemplo:

```
 $ curl http://localhost:3123/crawl?spider=all&timeout=5000&q='big data'
```
