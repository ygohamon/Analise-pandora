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

describe('VEICULOS', () => {
    before(function (done) {
        if (server) { done(); }
        else {
            inicializaSistema()
                .then(() => {
                    done();
                });
        }
    });
    
    describe('GET /veiculos/detalhado/cpf/:cpf', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/veiculos/detalhado/cpf/10977198804')
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
                .get('/veiculos/detalhado/cpf/10977198804')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_TOKEN_NAO_ENCONTRADO);
                    chai.expect(res.body).to.have.property('msg');
                
                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/veiculos/detalhado/cpf/12345678910')
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
                .get('/veiculos/detalhado/cpf/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);
                    chai.expect(res.body).to.have.property('msg');
                
                    done();
                });
        });
    });

    describe('GET /veiculos/detalhado/cnpj/:cnpj', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/veiculos/detalhado/cnpj/01246084000100')
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
                .get('/veiculos/detalhado/cnpj/01246084000100')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');
                
                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/veiculos/detalhado/cnpj/12345678910234')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);
                
                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/veiculos/detalhado/cnpj/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

    describe('GET /veiculos/detalhado/nome/:nome', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/veiculos/detalhado/nome/ADILSON%20DO%20NASCIMENTO%20ANISIO')
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
                .get('/veiculos/detalhado/nome/ADILSON%20DO%20NASCIMENTO%20ANISIO')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', 'ETOKENNOTFOUND');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/veiculos/detalhado/nome/TESTE1%20TESTE2%20TESTE3')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);

                    done();
                });
        });

        it('Deve dar falha por parametro invalido', (done) => {
            chai.request(server)
                .get('/veiculos/detalhado/nome/TESTE1')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);

                    done();
                });
        });
    });

    describe('GET /veiculos/detalhado/cnpj/:cnpj', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/veiculos/detalhado/cnpj/01246084000100')
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
                .get('/veiculos/detalhado/cnpj/01246084000100')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_TOKEN_NAO_ENCONTRADO);
                    chai.expect(res.body).to.have.property('msg');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/veiculos/detalhado/cnpj/12345678910234')
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
                .get('/veiculos/detalhado/cnpj/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);
                    chai.expect(res.body).to.have.property('msg');

                    done();
                });
        });
    });

    describe('GET /veiculos/detalhado/placa/:placa', () => {
        it('Deve retornar um resultado válido', (done) => {
            chai.request(server)
                .get('/veiculos/detalhado/placa/AEK3579')
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
                .get('/veiculos/detalhado/placa/AEK3579')
                .end((error, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_TOKEN_NAO_ENCONTRADO);
                    chai.expect(res.body).to.have.property('msg');

                    done();
                });
        });

        it('Deve retornar um resultado não encontrado', (done) => {
            chai.request(server)
                .get('/veiculos/detalhado/placa/AAA1111')
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
                .get('/veiculos/detalhado/placa/123')
                .query({ test: 's' })
                .end((error, res) => {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);
                    chai.expect(res.body).to.have.property('msg');

                    done();
                });
        });
    });

    // describe('GET /veiculos/detalhado/chassi/:chassi', () => {
    //     it('Deve retornar um resultado válido', (done) => {
    //         chai.request(server)
    //             .get('/veiculos/detalhado/chassi/B8449838')
    //             .query({ test: 's' })
    //             .end((error, res) => {
    //                 chai.expect(res).to.have.status(200);
    //                 chai.expect(res.body).to.have.property('status', API_CODES.CODE_SUCESSO);
    //                 chai.expect(res.body).to.have.property('dados');
    //                 chai.expect(res.body).to.have.property('dados').be.a('array');

    //                 done();
    //             });
    //     });

    //     it('Deve dar falha por falta token', (done) => {
    //         chai.request(server)
    //             .get('/veiculos/detalhado/chassi/B8449838')
    //             .end((error, res) => {
    //                 chai.expect(res).to.have.status(401);
    //                 chai.expect(res.body).to.have.property('status', API_CODES.CODE_TOKEN_NAO_ENCONTRADO);
    //                 chai.expect(res.body).to.have.property('msg');

    //                 done();
    //             });
    //     });

    //     it('Deve retornar um resultado não encontrado', (done) => {
    //         chai.request(server)
    //             .get('/veiculos/detalhado/chassi/BBBBBB8449838')
    //             .query({ test: 's' })
    //             .end((error, res) => {
    //                 chai.expect(res).to.have.status(200);
    //                 chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);
    //                 chai.expect(res.body).to.have.property('msg');

    //                 done();
    //             });
    //     });

    //     it('Deve dar falha por parametro invalido', (done) => {
    //         chai.request(server)
    //             .get('/veiculos/detalhado/chassi/1')
    //             .query({ test: 's' })
    //             .end((error, res) => {
    //                 chai.expect(res).to.have.status(400);
    //                 chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);
    //                 chai.expect(res.body).to.have.property('msg');

    //                 done();
    //             });
    //     });
    // });

    // describe('GET /veiculos/detalhado/renavam/:renavam', () => {
    //     it('Deve retornar um resultado válido', (done) => {
    //         chai.request(server)
    //             .get('/veiculos/detalhado/renavam/00180230077')
    //             .query({ test: 's' })
    //             .end((error, res) => {
    //                 chai.expect(res).to.have.status(200);
    //                 chai.expect(res.body).to.have.property('status', API_CODES.CODE_SUCESSO);
    //                 chai.expect(res.body).to.have.property('dados');
    //                 chai.expect(res.body).to.have.property('dados').be.a('array');

    //                 done();
    //             });
    //     });

    //     it('Deve dar falha por falta token', (done) => {
    //         chai.request(server)
    //             .get('/veiculos/detalhado/renavam/00180230077')
    //             .end((error, res) => {
    //                 chai.expect(res).to.have.status(401);
    //                 chai.expect(res.body).to.have.property('status', API_CODES.CODE_TOKEN_NAO_ENCONTRADO);
    //                 chai.expect(res.body).to.have.property('msg');

    //                 done();
    //             });
    //     });

    //     it('Deve retornar um resultado não encontrado', (done) => {
    //         chai.request(server)
    //             .get('/veiculos/detalhado/renavam/99180239999')
    //             .query({ test: 's' })
    //             .end((error, res) => {
    //                 chai.expect(res).to.have.status(200);
    //                 chai.expect(res.body).to.have.property('status', API_CODES.CODE_RECURSO_NAO_ENCONTRADO);
    //                 chai.expect(res.body).to.have.property('msg');

    //                 done();
    //             });
    //     });

    //     it('Deve dar falha por parametro invalido', (done) => {
    //         chai.request(server)
    //             .get('/veiculos/detalhado/renavam/123')
    //             .query({ test: 's' })
    //             .end((error, res) => {
    //                 chai.expect(res).to.have.status(400);
    //                 chai.expect(res.body).to.have.property('status', API_CODES.CODE_PARAM_INVALIDO);
    //                 chai.expect(res.body).to.have.property('msg');

    //                 done();
    //             });
    //     });
    // });
});

