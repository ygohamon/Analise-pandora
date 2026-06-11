import { Request, Response } from 'express';
import {
  crequestBing,
  // crequestQwant,
  // crequestStartPage,
  crequestYahoo,
  crequestDuck,
  requestPresearch,

  prequestJusbrasil,
  prequestGoogle,
  prequestLukol,
} from '../models';

import { flatten, allSettled, print, processAllSettled } from '../utils';

export const allController = async function (req: Request, res: Response) {

  const query = req.query.q;

  if (query) {

    try {
      const dados = await allSettled([
        // crequestQwant(req.query),
        crequestBing(req.query),
        crequestDuck(req.query),
        // crequestStartPage(req.query),
        crequestYahoo(req.query),
        requestPresearch(req.query),

        prequestGoogle(req.query),
        prequestLukol(req.query),
      ])
        .then(dados => dados.filter((p:any) => p.status === "fulfilled"))
        .then(dados => dados.map((p:any) => p.value))
        .then(dados => flatten(dados))
        .then(dados => dados.filter(p => p !== null))

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

export const doController = async function (req: Request, res: Response) {

  const query = req.query.q;

  if (query) {

    try {
      const dados = await allSettled([
        // crequestQwant(req.query),
        crequestBing(req.query),
        // crequestStartPage(req.query),
        crequestYahoo(req.query),
        requestPresearch(req.query),

        prequestGoogle(req.query),
        prequestLukol(req.query),
      ])
        .then(dados => processAllSettled(dados))
        .then(dados => flatten(dados))
        .then(dados => dados.filter(p => p !== null))

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

export const cheerioController = async function (req: Request, res: Response) {

  const query = req.query.q;

  if (query) {

    try {
      const dados = await allSettled([
        // crequestQwant(req.query),
        crequestBing(req.query),
        // crequestStartPage(req.query),
        crequestYahoo(req.query),
      ])
        .then(dados => processAllSettled(dados))
        .then(dados => flatten(dados))
        .then(dados => dados.filter(p => p !== null))

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

