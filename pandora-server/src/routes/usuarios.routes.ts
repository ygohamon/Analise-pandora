import { Router } from 'express';

import {
  GuardRotasPerfilAdmin,
  GuardRotasChecaHash,
  GuardRotasLogado
} from '../services/auth/authguard.service';

import {
  listaUsuarios,
  listaUsuariosParcial,
  getUsuario,
  getUsuarioMe,
  updateUsuario,
  updateSenhaUsuario,
  deleteUsuario,
  redefinirSenhaUsuario,
  atualizarPermissoesUsuario,
  getPermissoesUsuario,
  getPermissoesMe,
} from '../controllers/usuarios/usuarios.controller';

const usuarios: Router = Router();

usuarios.use(GuardRotasLogado);

usuarios.patch('/:id/trocasenha', updateSenhaUsuario);

// Usuário recebe informações sobre si
usuarios.get('/me', getUsuarioMe);
usuarios.get('/me/permissao', getPermissoesMe);

// As outras rotas precisam de autorização para serem executadas
usuarios.use(GuardRotasPerfilAdmin, GuardRotasChecaHash);

usuarios.get('/', listaUsuarios);
usuarios.get('/parcial/:login', listaUsuariosParcial);
usuarios.get('/:id', getUsuario);
usuarios.patch('/:id', updateUsuario);
usuarios.delete('/:id', deleteUsuario);
usuarios.patch('/:id/redefinirsenha', redefinirSenhaUsuario);


usuarios.get('/:id/permissao', getPermissoesUsuario);
usuarios.patch('/:id/permissao', atualizarPermissoesUsuario);


export default usuarios;

