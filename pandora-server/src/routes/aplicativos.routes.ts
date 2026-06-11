import { Router } from 'express';

import {
  GuardRotasPerfilAdmin,
  GuardRotasChecaHash,
  GuardRotasLogado
} from '../services/auth/authguard.service';

import {
  criar,
  getApps,
  atualizar
} from '../controllers/aplicativos/aplicativos.controller';

const aplicativos: Router = Router();

// As outras rotas precisam de autorização para serem executadas
aplicativos.use(GuardRotasPerfilAdmin, GuardRotasChecaHash);
aplicativos.post('/criar', criar);
aplicativos.patch('/atualizar/:id', atualizar);
aplicativos.get('/', getApps)

export default aplicativos;
