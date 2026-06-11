import { Request, Response } from 'express';
import { prequestDuck, crequestDuck } from '../models/duck.model';

export const duckController = async function (req: Request, res: Response) {

  const query = req.query.q;

  if (query) {
    try {
      const dados = await crequestDuck(req.query);
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

export const pduckController = async function (req: Request, res: Response) {

  const query = req.query.q;

  if (query) {
    try {
      const dados = await prequestDuck(req.query);
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

