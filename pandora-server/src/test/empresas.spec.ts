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

describe('EMPRESAS', () => {
    before(function (done) {
        if (server) { done(); }
        else {
            inicializaSistema()
                .then(() => {
                    done();
                });
        }
    });

    describe('GET /empresas/simplificado/cnpj/:cnpj', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/cnpj/01246084000100')
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
                .get('/empresas/simplificado/cnpj/01246084000100')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_TOKEN_NAO_ENCONTRADO);
                    chai.expect(res.body).to.have.property('msg');
                
                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/cnpj/12345678910234')
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
                .get('/empresas/simplificado/cnpj/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);
                    chai.expect(res.body).to.have.property('msg');
                
                    done();
                });
        });
    });
    describe('GET /empresas/detalhado/cnpj/:cnpj', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/cnpj/01246084000100')
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
                .get('/empresas/simplificado/cnpj/01246084000100')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_TOKEN_NAO_ENCONTRADO);
                    chai.expect(res.body).to.have.property('msg');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/cnpj/12345678910234')
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
                .get('/empresas/simplificado/cnpj/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);
                    chai.expect(res.body).to.have.property('msg');

                    done();
                });
        });
    });
    describe('GET /empresas/integrado/cnpj/:cnpj', function () {
        this.timeout(5000);

        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/cnpj/01246084000100')
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
                .get('/empresas/simplificado/cnpj/01246084000100')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_TOKEN_NAO_ENCONTRADO);
                    chai.expect(res.body).to.have.property('msg');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/cnpj/12345678910234')
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
                .get('/empresas/simplificado/cnpj/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);
                    chai.expect(res.body).to.have.property('msg');

                    done();
                });
        });
    });

    describe('GET /empresas/simplificado/razaosocial/:razaosocial', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/razaosocial/ELETRONICA%20MARTINS%20BAURU')
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
                .get('/empresas/simplificado/razaosocial/ELETRONICA%20MARTINS%20BAURU')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/razaosocial/TESTE1%20TESTE2%20TESTE3')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/razaosocial/TESTE1')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });
    describe('GET /empresas/simplificado/nomefantasia/:nomefantasia', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/nomefantasia/JUBILO%20LIVRARIA%20EVANGELICA%20')
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
                .get('/empresas/simplificado/nomefantasia/JUBILO%20LIVRARIA%20EVANGELICA%20')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/nomefantasia/TESTE1%20TESTE2%20TESTE3')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/nomefantasia/TESTE1')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

    describe('GET /empresas/simplificado/sociopf_cpf/:cpf', function () {
        this.timeout(5000);

        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/sociopf_cpf/00001542613')
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
                .get('/empresas/simplificado/sociopf_cpf/00001542613')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/sociopf_cpf/12345678910')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/sociopf_cpf/12')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });
    describe('GET /empresas/simplificado/sociopf_nome/:nome', function () {
        this.timeout(5000);

        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/sociopf_nome/DEVANI%20DA%20COSTA%20ALMEIDA')
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
                .get('/empresas/simplificado/sociopf_nome/ADILSON%20DO%20NASCIMENTO%20ANISIO')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/sociopf_nome/TESTE1%20TESTE2%20TESTE3')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/sociopf_nome/TESTE1')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

    describe('GET /empresas/simplificado/sociopj_cnpj/:cnpj', function () {
        this.timeout(5000);

        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/sociopj_cnpj/00000683000187')
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
                .get('/empresas/simplificado/sociopj_cnpj/01246084000100')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/sociopj_cnpj/12345678910234')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/empresas/simplificado/sociopj_cnpj/12')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });
});

