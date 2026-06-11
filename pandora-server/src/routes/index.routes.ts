import { Router, Request, Response, NextFunction } from 'express';

import { login, loginByApp } from '../controllers/usuarios/usuarios.controller';
import { cadastraPessoaUsuario } from '../controllers/pessoa_usuario/pessoa_usuario.controller';

import { API_CONFIG } from '../config';

const index: Router = Router();

index.get('/', (req: Request, res: Response, next: NextFunction) => res.status(200).send(API_CONFIG.CFG_NOME_SISTEMA));
index.post('/login', login);
index.post('/loginByApp', loginByApp);
index.post('/preusuarios', cadastraPessoaUsuario);

export default index;
