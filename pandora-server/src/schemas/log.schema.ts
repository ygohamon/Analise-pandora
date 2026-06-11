import { getId_Token, getIpRequest, getTime } from '../utils';

let useragent = require('useragent');
useragent(true);

export class Log {
    ip?:            string | string[];
    usuario?:       string;
    usuario_id?:    string;
    tipo?:          string;
    mensagem?:      string;
    data_hora?:     string;
    user_agent?:    string | string[];
    processo?:      string;


    constructor(obj: Log){
        if (obj.ip)
            this.ip             = obj.ip;
        if (obj.usuario_id)
            this.usuario_id     = obj.usuario_id;
        if (obj.usuario)
            this.usuario        = obj.usuario;
        if (obj.tipo)
            this.tipo           = obj.tipo;
        if (obj.mensagem)
            this.mensagem       = obj.mensagem;
        if (obj.data_hora) {
            this.data_hora      = obj.data_hora;
        } else {
            this.data_hora      = getTime();
        }
        if (obj.user_agent)
            this.user_agent     = obj.user_agent;
        if (obj.processo){
            this.processo       = obj.processo;
        } else {
            this.processo       = null;
        }
    }
}

export class NovoLog {
    ip?        : string;
    usuario?   : string;
    usuario_id?: string;
    secao?     : string;
    item?      : string;
    chave?     : string;
    valor?     : string;
    tipo?      : string;
    code?      : string;
    mensagem?  : string;
    data_hora? : string;
    user_agent?: string;
    url?       : string;
    os?        : string;
    browser?   : string;
    device?    : string;
    processo?  : string;

    constructor(obj){
        // Se passar a requisição, processa os dados através do objeto de requisição
        if(obj.req){
            this.ip         = getIpRequest(obj.req);
            this.usuario_id = getId_Token(obj.req.headers['authorization']);
            this.url        = obj.req.originalUrl;

            this.setUserAgent(obj.req.headers['user-agent']);
        } else {
            if (obj.ip) { this.ip = obj.ip; }
            if (obj.usuario_id) { this.usuario_id = obj.usuario_id; }
            if (obj.user_agent) { this.setUserAgent(obj.user_agent); }
        }

        if (obj.usuario) { this.usuario = obj.usuario; }

        if (obj.secao) {
            this.secao = obj.secao;
        } else {
            this.secao = null;
        }

        if (obj.item) {
            this.item = obj.item;
        } else {
            this.item = null;
        }

        if (obj.code) {
            this.code = obj.code;
        } else {
            this.code = null;
        }

        if (obj.chave) {
            this.chave = obj.chave;
        } else {
            this.chave = null;
        }

        if (obj.tipo) {
            this.tipo = obj.tipo;
        } else {
            this.tipo = null;
        }

        if (obj.valor) {
            this.valor = obj.valor;
        } else {
            this.valor = null;
        }

        if (obj.mensagem) {
            this.mensagem = obj.mensagem;
        } else {
            this.mensagem = null;
        }

        if (obj.data_hora) {
            this.data_hora = obj.data_hora;
        } else {
            this.data_hora = getTime();
        }

        if (obj.processo){
            this.processo = obj.processo;
        } else {
            this.processo = null;
        }

    }

    setUserAgent(ua) {
        let agent = useragent.parse(ua);

        if (agent.major !== '0') {
            this.browser    = `${agent.family} ${agent.major}`;
        } else {
            this.browser    = `${agent.family}`;
        }

        if (agent.os.major !== '0') {
            this.os         = `${agent.os.family} ${agent.os.major}`;
        } else {
            this.os         = `${agent.os.family}`;
        }

        if (agent.device.major !== '0') {
            this.device     = `${agent.device.family} ${agent.device.major}`;
        } else {
            this.device     = `${agent.device.family}`;
        }

        this.user_agent = ua
    }
}
