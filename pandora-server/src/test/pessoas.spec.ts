import * as chai from 'chai';
import chaiHttp = require('chai-http');

import { inicializaSistema, server } from './inicializasistema';

import {
    API_CONFIG,
    API_CODES,
    API_MSGS,
    LOG_CODES,
    LOG_MSGS
} from './../config';

chai.use(chaiHttp);

describe('PESSOAS', () => {
    before(function (done) {
        if (server) { done(); }
        else {
            inicializaSistema()
                .then(() => {
                    done();
                });
        }
    });

    describe('GET /pessoas/simplificado/cpf/:cpf', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/cpf/10977198804')
                .query({test: 's'})
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_SUCESSO);
                    chai.expect(res.body).to.have.property('dados');
                    chai.expect(res.body).to.have.property('dados').be.a('array');

                    done();
                });
        });

        it('Deve dar falha por falta token', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/cpf/10977198804')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_TOKEN_NAO_ENCONTRADO);
                    chai.expect(res.body).to.have.property('msg');
                
                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/cpf/12345678910')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);
                    chai.expect(res.body).to.have.property('msg');
                
                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/cpf/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);
                    chai.expect(res.body).to.have.property('msg');
                
                    done();
                });
        });
    });

    describe('GET /pessoas/detalhado/cpf/:cpf', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/pessoas/detalhado/cpf/10977198804')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_SUCESSO);
                    chai.expect(res.body).to.have.property('dados');
                    chai.expect(res.body).to.have.property('dados').be.a('array');

                    done();
                });
        });

        it('Deve dar falha por falta token', (done) => {
            chai.request(server)
                .get('/pessoas/detalhado/cpf/10977198804')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');
                
                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/pessoas/detalhado/cpf/12345678910')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);
                
                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/pessoas/detalhado/cpf/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });
    
    describe('GET /pessoas/integrado/cpf/:cpf', function () {
        this.timeout(5000);

        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/pessoas/integrado/cpf/10977198804')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_SUCESSO);                     chai.expect(res.body).to.have.property('dados');                     chai.expect(res.body).to.have.property('dados').be.a('array');

                    done();
                });
        });

        it('Deve dar falha por falta token', (done) => {
            chai.request(server)
                .get('/pessoas/integrado/cpf/10977198804')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');
                
                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/pessoas/integrado/cpf/12345678910')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);
                
                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/pessoas/integrado/cpf/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

    describe('GET /pessoas/integrado/rg/:rg', function () {
        this.timeout(5000);

        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/pessoas/integrado/rg/10977198804')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_SUCESSO);                     chai.expect(res.body).to.have.property('dados');                     chai.expect(res.body).to.have.property('dados').be.a('array');

                    done();
                });
        });

        it('Deve dar falha por falta token', (done) => {
            chai.request(server)
                .get('/pessoas/integrado/rg/10977198804')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');
                
                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/pessoas/integrado/rg/12345678910')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);
                
                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/pessoas/integrado/rg/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

    describe('GET /pessoas/simplificado/nome/:nome', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/nome/ADILSON%20DO%20NASCIMENTO%20ANISIO')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_SUCESSO);
                    chai.expect(res.body).to.have.property('dados');
                    chai.expect(res.body).to.have.property('dados').be.a('array');

                    done();
                });
        });

        it('Deve dar falha por falta de token', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/nome/ADILSON%20DO%20NASCIMENTO%20ANISIO')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/nome/TESTE1%20TESTE2%20TESTE3')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/nome/TESTE1')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

    describe('GET /pessoas/simplificado/cnh/:cnh', function () {
        this.timeout(5000);

        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/cnh/05329588573')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_SUCESSO);                     chai.expect(res.body).to.have.property('dados');                     chai.expect(res.body).to.have.property('dados').be.a('array');

                    done();
                });
        });

        it('Deve dar falha por falta de token', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/cnh/05329588573')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/cnh/05329580000')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/cnh/12')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

    describe('GET /pessoas/simplificado/rg/:rg', function () {
        this.timeout(5000);

        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/rg/2664008')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_SUCESSO);
                    chai.expect(res.body).to.have.property('dados');
                    chai.expect(res.body).to.have.property('dados').be.a('array');

                    done();
                });
        });

        it('Deve dar falha por falta de token', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/rg/2664008')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/rg/0664000')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/rg/12')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

    describe('GET /pessoas/simplificado/titulo/:titulo', function () {
        this.timeout(5000);

        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/titulo/0017718722046')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_SUCESSO);
                    chai.expect(res.body).to.have.property('dados');
                    chai.expect(res.body).to.have.property('dados').be.a('array');

                    done();
                });
        });

        it('Deve dar falha por falta de token', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/titulo/0017718722046')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/titulo/0017718722000')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/titulo/12')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

    describe('GET /pessoas/simplificado/nomepai/:nomepai', function () {
        this.timeout(5000);

        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/nomepai/GALDINO%20MARCELINO%20DE%20MORAES')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_SUCESSO);
                    chai.expect(res.body).to.have.property('dados');
                    chai.expect(res.body).to.have.property('dados').be.a('array');

                    done();
                });
        });

        it('Deve dar falha por falta de token', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/nomepai/GALDINO%20MARCELINO%20DE%20MORAES')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/nomepai/TESTE1%20TESTE2%20MORAES')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/nomepai/TESTE1')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

    describe('GET /pessoas/simplificado/nomemae/:nomemae', function () {
        this.timeout(5000);

        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/nomemae/REGINE%20BERTRAND%20CARMONA')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_SUCESSO);
                    chai.expect(res.body).to.have.property('dados');
                    chai.expect(res.body).to.have.property('dados').be.a('array');

                    done();
                });
        });

        it('Deve dar falha por falta de token', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/nomemae/REGINE%20BERTRAND%20CARMONA')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/nomemae/TESTE1%20TESTE2%20MORAES')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/nomemae/TESTE1')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

    describe('GET /pessoas/simplificado/telefone/:telefone', function () {
        this.timeout(5000);

        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/telefone/8334391076')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_SUCESSO);
                    chai.expect(res.body).to.have.property('dados');
                    chai.expect(res.body).to.have.property('dados').be.a('array');

                    done();
                });
        });

        it('Deve dar falha por falta de token', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/telefone/8334391076')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/telefone/00010001')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/pessoas/simplificado/telefone/12')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

});

