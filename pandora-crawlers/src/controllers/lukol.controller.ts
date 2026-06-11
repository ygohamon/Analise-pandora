import { Request, Response } from 'express';
import { prequestLukol } from '../models';

export const lukolController = async function (req: Request, res: Response) {

  const query = req.query.q;

  if (query) {
    try {
      const dados = await prequestLukol(req.query);
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

