import { Request, Response } from 'express';
import { crequestGoogle, prequestGoogle } from '../models';

export const googleController = async function (req: Request, res: Response) {

  const query = req.query.q;

  if (query) {
    try {
      const dados = await crequestGoogle(req.query);
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

export const pgoogleController = async function (req: Request, res: Response) {

  const query = req.query.q;

  if (query) {
    try {
      const dados = await prequestGoogle(req.query);
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

