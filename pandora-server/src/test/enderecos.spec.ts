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

describe('ENDERECOS', () => {
    before(function (done) {
        if (server) { done(); }
        else {
            inicializaSistema()
                .then(() => {
                    done();
                });
        }
    });

    describe('GET /enderecos/simplificado/cpf/:cpf', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/enderecos/simplificado/cpf/10977198804')
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
                .get('/enderecos/simplificado/cpf/10977198804')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_TOKEN_NAO_ENCONTRADO);
                    chai.expect(res.body).to.have.property('msg');
                
                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/enderecos/simplificado/cpf/12345678910')
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
                .get('/enderecos/simplificado/cpf/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);
                    chai.expect(res.body).to.have.property('msg');
                
                    done();
                });
        });
    });

    describe('GET /enderecos/simplificado/cnpj/:cnpj', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/enderecos/simplificado/cnpj/01246084000100')
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
                .get('/enderecos/simplificado/cnpj/01246084000100')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');
                
                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/enderecos/simplificado/cnpj/12345678910234')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);
                
                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/enderecos/simplificado/cnpj/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

});

