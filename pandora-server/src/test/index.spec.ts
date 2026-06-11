import * as jwt from 'jsonwebtoken';
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

describe('INDEX ', () => {
    before(function (done) {
        if (server) { done(); }
        else {
            inicializaSistema()
                .then(() => {
                    done();
                });
        }
    });

    describe('GET /', () => {
        it('Deve retornar o texto SIAP', (done) => {
            chai.request(server)
                .get('/')
                .end((error, res: ChaiHttp.Response) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.text).to.be.equal('SIAP');

                    done();
                });
        });
    });

    describe('POST /login', () => {
        it('Deve dar falha por falta do recaptcha', (done) => {
            chai.request(server)
                .post('/login')
                .send({ login: 'asd', senha: 'asd' })
                .end((error, res: ChaiHttp.Response) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECAPTCHA_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por problema na validacao do recaptcha', (done) => {
            chai.request(server)
                .post('/login')
                .send({ login: 'asd', senha: 'asd', recaptcha: '123' })
                .end((error, res: ChaiHttp.Response) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECAPTCHA_INVALIDO);

                    done();
                });
        });

        it('Deve retornar um token valido de acesso', (done) => {
            chai.request(server)
                .post('/login?test=s')
                .send({ login: 'DEV', senha: 'gaeco@123' })
                .end((error, res: ChaiHttp.Response) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_SUCESSO);
                    chai.expect(res.body).to.have.property('msg', API_MSGS.MSG_LOGIN_SUCESSO);

                    chai.expect(res.body).to.have.property('dados').be.a('object');
                    const token = res.body.dados.token;
                    let decoded;
                    try {
                        decoded = jwt.verify(token, API_CONFIG.JWT_TOKEN_SENHA, { algorithms: ['HS256'] });
                        decoded = 1;
                    } catch (err) {
                        decoded = 0;
                    }
                    chai.expect(decoded).to.be.equal(1);

                    done();
                });
        });

        it('Deve dar falha por problema na autenticacao', (done) => {
            chai.request(server)
                .post('/login?test=s')
                .send({ login: 'DEV', senha: 'xxx' })
                .end((error, res: ChaiHttp.Response) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_FALHA_LOGIN);

                    done();
                });
        });
    });

    describe('POST /externo', () => {
        it('Deve dar falha por payload invalido', (done) => {
            chai.request(server)
                .post('/externo')
                .send({ payload: '123' })
                .end((error, res: ChaiHttp.Response) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PAYLOAD_INVALIDO);

                    done();
                });
        });

    });
});
