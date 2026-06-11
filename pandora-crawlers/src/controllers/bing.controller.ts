import { Request, Response } from 'express';
import { crequestBing } from '../models';
import { logger } from '../services/log.service';

export const bingController = async function (req: Request, res: Response) {

  const query = req.query.q;
  if (query) {
    try {
      const dados = await crequestBing(req.query);
      if (dados.length) {
        res.status(200).send(dados);
      } else {
        res.status(404).send([]);
      }
    } catch (error) {
      res.status(500).send(null);
    }
  } else {
    res.status(400).send(null);
  }
}
