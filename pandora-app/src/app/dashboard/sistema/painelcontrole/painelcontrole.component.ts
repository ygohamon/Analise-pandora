import { Component, OnInit } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MessageService } from 'primeng/api';

import { UtilsService } from '../../../services/common/utils.service';
import { SistemaService } from './../../../services/sistema/sistema.service';
import { MailerService } from './../../../services/mailer/mailer.service';

interface PainelDB {
    connected: boolean,
    engine: string,
    config: {
      server?: string,
      port?: number,
      database?: string,
      requestTimeout?: number,
      connectionTimeout?: number,
      engine?: string,
    }
}

interface PainelMail {
    connected?: boolean,
    enabled?: boolean,
    debug?: boolean,
    method?: string,
    config?: {
      host?: string,
      port?: number,
      user?: number,
    }
}

interface PainelCache {
  connected?: boolean,
  debug?: boolean,
  enabled?: boolean,
  duration?: string,
  method?: string,
  keysCount?: number,
  redis?: {
    host: string,
    port: number,
    version: string,
    mem: {
      used_memory_human: string,
      used_memory_rss_human: string,
      maxmemory_human: string,
      maxmemory_policy: string,
    }
  },
}

@Component({
  selector: 'app-painelcontrole',
  styles: [`
    .ativado { color: green; }
    .desativado { color: red; }
  `],
  templateUrl: './painelcontrole.component.html'
})
export class PainelControleComponent implements OnInit {

  // Variavel para fazer o unsubscribe dos Observable
  private _destroy$ = new Subject();

  buscaFalha = false;
  buscaFinalizada = false;
  buscaSucesso = false;
  usuariosEncontrados = [];

  painelDB: PainelDB;
  mostraPainelDB: boolean;

  painelAPICache: PainelCache;
  mostraPainelAPICache: boolean;

  painelModelCache: PainelCache;
  mostraPainelModelCache: boolean;

  painelMail: PainelMail;
  mostraPainelMail: boolean;

  constructor(
    private sistema: SistemaService,
    private message: MessageService,
    public utils: UtilsService,
    private mailer: MailerService,
  ) {}

  ngOnInit() {
    this.resetaPainelAPICache();
    this.resetaPainelDB();
    this.resetaPainelModelCache();
    this.resetaPainelMail();

    this.getPainelDB();
    this.getPainelAPICache();
    this.getPainelModelCache();
    this.getPainelMail();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  resetaPainelDB() {
    this.mostraPainelDB = false;
    this.painelDB = {
      connected: false,
      engine: null,
      config: null
    }
  }

  resetaPainelAPICache() {
    this.mostraPainelAPICache = false;
    this.painelAPICache = null;
  }

  resetaPainelModelCache() {
    this.mostraPainelModelCache = false;
    this.painelModelCache = null;
  }

  resetaPainelMail() {
    this.mostraPainelMail = false;
    this.painelMail = {
      connected: false,
      debug: false,
      enabled: false,
      method: null,
    }
  }

  getPainelDB() {
    this.sistema.getDBInfo()
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {
          this.painelDB = dados as any;
          this.mostraPainelDB = true;
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar as informações do BD.'));
      });
  }

  getPainelAPICache() {
    this.sistema.getAPICacheInfo()
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {
          this.painelAPICache = dados as any;
          this.mostraPainelAPICache = true;
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os dados do APICache.'));
      });
  }

  getPainelModelCache() {
    this.sistema.getModelCacheInfo()
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {
          this.painelModelCache = dados as any;
          this.mostraPainelModelCache = true;
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os dados do ModelCache.'));
      });
  }

  getPainelMail() {
    this.mailer.getMailInfo()
      .pipe(takeUntil(this._destroy$))
        .subscribe(resultado => {
          const {status, msg, dados} = resultado;

          if (status === 'OK') {
            this.painelMail = dados as any;
            this.mostraPainelMail = true;
          } else {
            this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
          }
        }, error => {
          this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao buscar os do MailService.'));
        });
  }

  limparAPICache() {
    this.sistema.clearAPICache()
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {
          this.message.add(this.utils.mensagemSucesso('Sucesso', 'APICache limpa com sucesso'));
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao limpar APICache.'));
      });
  }

  limparModelCache() {
    this.sistema.clearModelCache()
      .pipe(takeUntil(this._destroy$))
      .subscribe(resultado => {
        const {status, msg, dados} = resultado;

        if (status === 'OK') {
          this.message.add(this.utils.mensagemSucesso('Sucesso', 'ModelCache limpa com sucesso'));
        } else {
          this.message.add(this.utils.trataRequisicaoNaoSucesso(status, msg));
        }
      }, error => {
        this.message.add(this.utils.trataErroRequisicao(error, 'Ocorreu um erro ao limpar ModelCache.'));
      });
  }

}
