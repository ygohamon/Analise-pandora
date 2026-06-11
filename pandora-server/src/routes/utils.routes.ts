import { Router, Request, Response } from 'express';

import {
  getOrgaoMunicipalEstadual,
  getUgestoraMunicipalEstadual
} from '../controllers/utils/utils.controller';

import {
    GuardRotasPerfilPrivado,
    GuardRotasChecaHash
} from './../services/auth/authguard.service';


const utils: Router = Router();

utils.use(GuardRotasPerfilPrivado, GuardRotasChecaHash);

utils.get('/orgao', getOrgaoMunicipalEstadual);
utils.get('/ugestora', getUgestoraMunicipalEstadual);

export default utils;
