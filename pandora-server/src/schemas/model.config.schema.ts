import { logger } from "../services/log.service";

export interface ModelConfigInterface {
  nome: string,
  ativado: boolean,
  sigla?: string,
  params?: any[],
  vars?: object
}

export class ModelConfig  {
  nome: string;
  ativado: boolean;
  sigla: string;
  params: any[];
  private vars: object;

  constructor(config: ModelConfigInterface) {
    this.nome = config?.nome;
    this.ativado = (config?.ativado === true) ? true : false;
    this.sigla = config?.sigla;
    this.params = config?.params;
    this.vars = config?.vars;
  }

  get(key: string) {
    if (!this.vars) return null;

    // Se a chave não existir na lista de variáveis
    if (!this.vars.hasOwnProperty(key)){
      logger.warn(`[MODEL] Chave '${key}' nao esta presente no model ${this.nome}`);
      this.print();
      return null;
    } else {
      return this.vars[key];
    }
  }

  print() {
    logger.info(`[MODEL] Print - ${this.nome}: ${this.ativado}`);
    logger.info(`[MODEL] Sigla: ${this.sigla}`);
    logger.info(`[MODEL] Params: ${this.params}`);
    logger.info(`[MODEL] Vars: ${JSON.stringify(this.vars, null, 2)}`);

  }
}
