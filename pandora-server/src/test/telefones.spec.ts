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

describe('TELEFONES', () => {
    before(function (done) {
        if (server) { done(); }
        else {
            inicializaSistema()
                .then(() => {
                    done();
                });
        }
    });

    describe('GET /telefones/simplificado/cpf/:cpf', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/telefones/simplificado/cpf/10977198804')
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
                .get('/telefones/simplificado/cpf/10977198804')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_TOKEN_NAO_ENCONTRADO);
                    chai.expect(res.body).to.have.property('msg');
                
                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/telefones/simplificado/cpf/12345678910')
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
                .get('/telefones/simplificado/cpf/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);
                    chai.expect(res.body).to.have.property('msg');
                
                    done();
                });
        });
    });

    describe('GET /telefones/simplificado/cnpj/:cnpj', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/telefones/simplificado/cnpj/01246084000100')
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
                .get('/telefones/simplificado/cnpj/01246084000100')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');
                
                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/telefones/simplificado/cnpj/12345678910234')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);
                
                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/telefones/simplificado/cnpj/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

    describe('GET /telefones/simplificado/nome/:nome', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/telefones/simplificado/nome/ADILSON%20DO%20NASCIMENTO%20ANISIO')
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
                .get('/telefones/simplificado/nome/ADILSON%20DO%20NASCIMENTO%20ANISIO')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/telefones/simplificado/nome/TESTE1%20TESTE2%20TESTE3')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/telefones/simplificado/nome/TESTE1')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

    describe('GET /telefones/simplificado/cnpj/:cnpj', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/telefones/simplificado/cnpj/01246084000100')
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
                .get('/telefones/simplificado/cnpj/01246084000100')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_TOKEN_NAO_ENCONTRADO);
                    chai.expect(res.body).to.have.property('msg');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/telefones/simplificado/cnpj/12345678910234')
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
                .get('/telefones/simplificado/cnpj/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);
                    chai.expect(res.body).to.have.property('msg');

                    done();
                });
        });
    });

    describe('GET /telefones/simplificado/telefone/:telefone', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/telefones/simplificado/telefone/99080479')
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
                .get('/telefones/simplificado/telefone/99080479')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_TOKEN_NAO_ENCONTRADO);
                    chai.expect(res.body).to.have.property('msg');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/telefones/simplificado/telefone/1234567')
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
                .get('/telefones/simplificado/telefone/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);
                    chai.expect(res.body).to.have.property('msg');

                    done();
                });
        });
    });

});

