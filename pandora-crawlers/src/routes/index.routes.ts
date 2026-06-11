import { Router, Request, Response } from 'express';

import { gots } from '../services/got.service';
import { tors } from '../services/tor.service';

import {
  yahooController,
  jusbrasilController,
  duckController,
  googleController,
  bingController,
  pgoogleController,
  lukolController,
  // qwantController,
  // startpageController,
  presearchController,
  allController,
  doController,
  cheerioController
} from '../controllers';

const index: Router = Router();

index.get('/crawl', (req: Request, res: Response, next) => {
  const spider = req.query.spider;

  switch (spider) {
    case 'yahoo':
      yahooController(req, res);
      break;

    case 'jusbrasil':
      jusbrasilController(req, res);
      break;

    case 'duck':
      duckController(req, res);
      break;

    case 'presearch':
      presearchController(req, res);
      break;

    case 'bing':
      bingController(req, res);
      break;

    case 'google':
      googleController(req, res);
      break;

    case 'google':
      pgoogleController(req, res);
      break;

    case 'lukol':
      lukolController(req, res);
      break;
/* 
    case 'qwant':
      qwantController(req, res);
      break;

    case 'startpage':
      startpageController(req, res);
      break; */

    case 'all':
      allController(req, res);
      break;

    case 'do':
      doController(req, res);
      break;

    case 'cheerio':
      cheerioController(req, res);
      break;

    default:
      res.send(404).send('Spider não identificado!')
      break;
  }
});


// Checa o IP
index.get('/ip', async (req, res) => res.send(JSON.parse((await gots.get('http://scooterlabs.com/echo.json')).body)))

// Checa o TOR
index.get('/tor/ip', async (req, res) => res.json(JSON.parse((await gots.getTor('http://scooterlabs.com/echo.json')).body)))
index.get('/tor/reset', async (req, res) => res.send(await tors.reset()))

export default index;
