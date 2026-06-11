import { Router } from 'express';

import {
    GuardRotasPerfilAdmin,
    GuardRotasChecaHash,
    GuardRotasLogado
} from '../services/auth/authguard.service';

import {
    getPessoaUsuariosInativos,
    removePessoaUsuario,
    ativaPessoaUsuario,
    recadastraPessoaUsuario,
    ativaRecadastramentoPessoaUsuario
} from '../controllers/pessoa_usuario/pessoa_usuario.controller';

const preusuarios: Router = Router();

preusuarios.use(GuardRotasLogado, GuardRotasChecaHash);

preusuarios.post('/recadastramento', recadastraPessoaUsuario);

preusuarios.use(GuardRotasPerfilAdmin, GuardRotasChecaHash);

preusuarios.get('/inativos', getPessoaUsuariosInativos);
preusuarios.delete('/:id', removePessoaUsuario);
preusuarios.post('/:id/recadastra', ativaRecadastramentoPessoaUsuario);
preusuarios.post('/ativar/:id', ativaPessoaUsuario);

export default preusuarios;
