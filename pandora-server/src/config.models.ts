import { ModelConfig, ModelConfigInterface } from "./schemas/model.config.schema";
import { logger } from "./services/log.service";

const _model_core = require('../.envs/models/model.core.json');
let _model_nacional;
let _model_local;

try{
  _model_nacional = require('../.envs/models/model.nacional.json');
} catch(err) {
  _model_nacional = null;
  logger.warn('')
  logger.warn('Atencão!')
  logger.warn(`O arquivo de configuração 'model.nacional.json' para as bases de dados nacionais não foi encontrado no diretório ./envs/models/.`)
  logger.warn(`Forneça um arquivo seguindo o padrão feito em 'model.core.json'`)
  logger.warn('')
}

try{
  _model_local = require('../.envs/models/model.local.json');
} catch(err) {
  _model_local = null;
  logger.warn('')
  logger.warn('Atencão!')
  logger.warn(`O arquivo de configuração 'model.local.json' para as bases de dados locais não foi encontrado no diretório ./envs/models/.`)
  logger.warn(`Forneça um arquivo seguindo o padrão feito em 'model.core.json'`)
  logger.warn('')
}

export const getModelConfig = function(chave: string) {
  const config = MODEL_CONFIG.filter(m => m.nome === chave)[0];
  return new ModelConfig (config);
}

const MODEL_CORE: ModelConfigInterface[] = _model_core || [];
const MODEL_NACIONAL: ModelConfigInterface[] = _model_nacional || [];
const MODEL_LOCAL: ModelConfigInterface[] = _model_local || [];

export const MODEL_CONFIG: ModelConfigInterface[] = MODEL_CORE.concat(MODEL_NACIONAL).concat(MODEL_LOCAL);
