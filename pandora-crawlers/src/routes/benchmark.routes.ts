import { Router } from 'express';

/**
 * Criada para fornecer rotas para medir o desempenho do sistema
 */
const benchmark: Router = Router();

benchmark.get('/simples', function (req, res, next) {
    res.send('randChars');
});

export default benchmark;
