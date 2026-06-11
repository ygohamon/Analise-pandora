import { v4 as uuidv4 } from 'uuid';

export let API_CONFIG = {
    CFG_NOME_SISTEMA: 'PANDORA',
    CFG_ENV: 'production',
    CFG_TEMPO_VALIDADE_HASH: 30000, // 5s

    SERVER_MAX_RESULTS: 1000,
    SERVER_CRAWLERS_URL: `http://${process.env.CRAWLERS_SERVER}:${process.env.CRAWLERS_PORT}`,
    SERVER_ARIEL_URL: `https://${process.env.ARIEL_SERVER}:${process.env.ARIEL_PORT}`,
    SERVER_AES_PW: (process.env.SERVER_AES_PW) ? process.env.SERVER_AES_PW : uuidv4(),
    SERVER_SESSION_SECRET: (process.env.SESSION_SECRET) ? process.env.SESSION_SECRET : uuidv4(),

    /**
     * Configurações do JWT
     */
    JWT_TOKEN_SENHA: (process.env.JWT_TOKEN_SENHA) ? process.env.JWT_TOKEN_SENHA : uuidv4(),
    JWT_TOKEN_TEMPO_EXPIRACAO: 3600*6, // Em segundos
    JWT_TOKEN_HASH_ALGORITHM: 'HS512',

    /**
     * Configurações com o AD da DITEC-MP/PB
     */
    MP_DITEC_WSDL_URL: "http://10.128.0.23:8080/axis2/services/WSAcesso?wsdl",
    MP_DITEC_REQUEST_TIMEOUT: 5000,

    AD_TIMEOUT: 5000,

    AD_MP_URL: '10.128.0.20',
    AD_MP_DOMAIN: '@intranet.mppb',
    AD_MP_BASE_DN: 'dc=mppb,dc=intranet',

    AD_LAB_URL: '10.128.24.47',
    AD_LAB_DOMAIN: '@gaeco.mppb.mp.br',
    AD_LAB_BASE_DN: 'dc=gaeco,dc=intranet',

    /**
     * Configurações com os serviços do Google
     */
    GOOGLE_RECAPTCHA_SECRET_KEY: process.env.GOOGLE_RECAPTCHA_SECRET_KEY || '',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
}

export let API_CODES = {
    CODE_ERRO_500                : 'ESERVER',
    CODE_PARAM_INVALIDO          : 'EPARAMINVALID',
    CODE_RECURSO_NAO_ENCONTRADO  : 'ENOTFOUND',
    CODE_ROTA_NAO_AUTORIZADA     : 'ENOTAUTH',
    CODE_BOT_DETECTADO           : 'EBOTDETECTED',
    CODE_QUOTA_ACESSO_ZERADA     : 'EQUOTAEMPTY',
    CODE_TOKEN_INVALIDO          : 'ETOKENNOTVALID',
    CODE_TOKEN_NAO_ENCONTRADO    : 'ETOKENNOTFOUND',
    CODE_HASH_INVALIDO           : 'EHASHNOTVALID',
    CODE_HASH_NAO_ENCONTRADO     : 'EHASHNOTFOUND',
    CODE_FALHA_LOGIN             : 'ELOGINFAILED',
    CODE_PAYLOAD_INVALIDO        : 'EPAYLOADNOTVALID',
    CODE_PASSWORD_INVALIDO       : 'EPASSWORDNOTVALID',
    CODE_RECAPTCHA_INVALIDO      : 'ERECAPTCHANOTVALID',
    CODE_APLICATIVO_NAOAUTORIZADO: 'EAPPINVLAID',
    CODE_RECAPTCHA_NAO_ENCONTRADO: 'ERECAPTCHANOTFOUND',
    CODE_APP_NAO_ENCONTRADO      : 'EAPPNOTFOUND',
    CODE_CPF_JA_CADASTRADO       : 'ECPFEXIST',
    CODE_CADASTRO_INCOMPLETO     : 'EREGISTERINCOMPLETE',

    CODE_RECURSO_ENCONTRADO      : 'OK',
    CODE_SUCESSO                 : 'OK',
}

export let API_MSGS = {
    MSG_ERRO_500                                : 'Falha inesperada nos servidores.'.toUpperCase(),
    MSG_CPF_EXISTENTE                           : 'CPF já cadastrado no sistema.'.toUpperCase(),
    MSG_CADASTRO_PESSOA_SUCESSO                 : 'Pessoa cadastrada com sucesso.'.toUpperCase(),
    MSG_RECADASTRO_PESSOA_SUCESSO               : 'Pessoa recadastrada com sucesso.'.toUpperCase(),

    MSG_NOME_INSUFICIENTE                       : 'Parâmetro insuficiente, insira ao menos 2 nomes válidos.'.toUpperCase(),
    MSG_PARAM_INVALIDO                          : 'Parâmetro(s) inválido(s).'.toUpperCase(),
    MSG_TOKEN_INVALIDO                          : 'Token inválido, refaça o login para validar seu acesso.'.toUpperCase(),
    MSG_TOKEN_NAO_ENCONTRADO                    : 'Token não encontrada, faça o login no sistema'.toUpperCase(),
    MSG_RECAPTCHA_INVALIDO                      : 'Erro na validação do recaptcha.'.toUpperCase(),
    MSG_RECAPTCHA_NAO_ENCONTRADO                : 'Valor para validação do recaptcha não encontrado.'.toUpperCase(),
    MSG_HASH_INVALIDO                           : 'Hash inválido.'.toUpperCase(),
    MSG_HASH_NAO_ENCONTRADO                     : 'Hash não encontrado, acesso não autorizado'.toUpperCase(),
    MSG_ACESSO_NAO_AUTORIZADO                   : 'Acesso não autorizado.'.toUpperCase(),
    MSG_ROTA_NAO_AUTORIZADA                     : 'Rota não autorizada para o usuário.'.toUpperCase(),
    MSG_LOGIN_TIMEOUT                           : 'Login timeout.'.toUpperCase(),
    MSG_IPC_TIMEOUT                             : 'IPC timeout.'.toUpperCase(),
    MSG_BOT_DETECTADO                           : 'Requisição de bot detectada.'.toUpperCase(),
    MSG_QUOTA_ZERADA                            : 'Quotas de acesso ao sistema esgotadas, tente novamente em breve.'.toUpperCase(),

    MSG_FALHA_LOGIN                             : 'Login e/ou senha incorretos.'.toUpperCase(),
    MSG_LOGIN_SUCESSO                           : 'Login efetuado.'.toUpperCase(),
    MSG_LOGIN_USUARIO_INATIVO                   : 'Usuário inativo, peça permissão ao administrador para ter acesso ao sistema.'.toUpperCase(),
    MSG_LOGIN_USUARIO_INEXISTENTE               : 'Usuário inexistente.'.toUpperCase(),
    MSG_USUARIO_CADASTRO_INCOMPLETO             : 'Usuário com cadastro incompleto. Procure o administrador do sistema para atualizar o seu cadastro.'.toUpperCase(),

    MSG_RECURSO_NAO_ENCONTRADO                  : 'Registro não encontrado.'.toUpperCase(),
    MSG_PAYLOAD_INVALIDO                        : 'Payload para acesso externo inválido.'.toUpperCase(),
    MSG_ACESSO_EXTERNO_TOKEN_INVALIDO           : 'Falha ao validar token de acesso.'.toUpperCase(),
    MSG_ACESSO_EXTERNO_FALHA_CADASTRO_AUTOMATICO: 'Falha no cadastro automático do usuário'.toUpperCase(),

}

// HASH
// BANCO.TABELA.RECURSO (RECURSO É OPCIONAL, USADO PARA DIFERENCIAR SE A TABELA TIVER MAIS INFORMAÇÃO QUE
// PARA O RECURSO EM QUESTÃO)
export let MODEL_PRIORITY = {
    // PESSOA
    'cortex.pf':                                {rank: 0, grupo: 'pessoa',                  fonte: 'cortex'},
    'lince.pessoa':                             {rank: 1, grupo: 'pessoa',                  fonte: 'lince'},
    'ipc':                                      {rank: 1, grupo: 'pessoa',                  fonte: 'ipc'},
    'bd_receita.pf':                            {rank: 1, grupo: 'pessoa',                  fonte: 'bd_receita.pessoafisica'},
    'tse.pessoa':                               {rank: 2, grupo: 'pessoa',                  fonte: 'tse'},
    'receitanovo.pessoafisica':                 {rank: 2, grupo: 'pessoa',                  fonte: 'receitanovo.pessoafisica'},
    'detran.pessoa':                            {rank: 2, grupo: 'pessoa',                  fonte: 'detran.pessoa'},
    'renach.pessoa':                            {rank: 2, grupo: 'pessoa',                  fonte: 'renach_2016_08'},
    'ariel':                                    {rank: 2, grupo: 'pessoa',                  fonte: 'siap.ariel'},
    'trepb.pessoa':                             {rank: 2, grupo: 'pessoa',                  fonte: 'trepb.pessoa'},
    'receita.pf':                               {rank: 3, grupo: 'pessoa',                  fonte: 'receita.pf'},
    'receita_full.pf':                          {rank: 4, grupo: 'pessoa',                  fonte: 'receita_full.pf'},
    'sispesquisa.pessoas':                      {rank: 5, grupo: 'pessoa',                  fonte: 'sispesquisa.pessoas'},
    'sispesquisa.cnh':                          {rank: 6, grupo: 'pessoa',                  fonte: 'sispesquisa.cnh'},
    'sispesquisa.emails.pessoa':                {rank: 6, grupo: 'pessoa',                  fonte: 'sispesquisa.emails'},
    'sispesquisa.prisional.pessoa':             {rank: 6, grupo: 'pessoa',                  fonte: 'sispesquisa.prisional'},
    'sispesquisa.telefones.pessoa':             {rank: 7, grupo: 'pessoa',                  fonte: 'sispesquisa.telefones'},
    'vep.pessoa':                               {rank: 8, grupo: 'pessoa',                  fonte: 'vep'},
    'credlink.pf':                              {rank: 9, grupo: 'pessoa',                  fonte: 'credlink'},


    // FOTO
    'ipc.foto':                                 {rank: 0, grupo: 'foto',                    fonte: 'ipc'},
    'bd_imagens.imagens_pf':                    {rank: 0, grupo: 'foto',                    fonte: 'bd_imagens.imagens_pf'},
    'sispesquisa.foto.renach':                  {rank: 0, grupo: 'foto',                    fonte: 'sispesquisa.foto.renach'},
    'sispesquisa.foto':                         {rank: 0, grupo: 'foto',                    fonte: 'sispesquisa.foto'},
    'sisdepen.foto':                            {rank: 0, grupo: 'foto',                    fonte: 'sisdepen.foto'},

    // EMPRESA
    'cortex.pj':                                {rank: 0, grupo: 'empresa',                 fonte: 'cortex' },
    'bd_receita.pj':                            {rank: 0, grupo: 'empresa',                 fonte: 'bd_receita.pj' },
    'receitanovo.pessoajuridica':               {rank: 1, grupo: 'empresa',                 fonte: 'receitanovo.pessoajuridica' },
    'sispesquisa.telefones.empresa':            {rank: 1, grupo: 'empresa',                 fonte: 'sispesquisa.telefones' },
    'receita_full.pj':                          {rank: 1, grupo: 'empresa',                 fonte: 'receita_full.pj' },
    'receita.pj':                               {rank: 2, grupo: 'empresa',                 fonte: 'receita.pj' },
    'credlink.pj':                              {rank: 3, grupo: 'empresa',                 fonte: 'credlink' },

    // FILIAL
    'receitanovo.pessoajuridica.filial':        {rank: 0, grupo: 'filial',                  fonte: 'receitanovo.pessoajuridica' },

    // ATIVIDADE ECONOMICA
    'cortex.atividadeeconomica':                {rank: 0, grupo: 'atividadeeconomica',      fonte: 'cortex'},

    // SOCIOS
    'bd_receita.sociopf':                       {rank: 0, grupo: 'socio_pf',                fonte: 'bd_receita.sociopf' },
    'bd_receita.sociopj':                       {rank: 0, grupo: 'socio_pj',                fonte: 'bd_receita.sociopj' },
    'bd_receita.socioestrangeiro':              {rank: 0, grupo: 'socio_estrangeiro',       fonte: 'bd_receita.socioestrangeiro' },
    'receita_full.sociopf':                     {rank: 1, grupo: 'socio_pf',                fonte: 'receita_full.sociopf' },
    'receita_full.sociopj':                     {rank: 1, grupo: 'socio_pj',                fonte: 'receita_full.sociopj' },
    'receita_full.socioestrangeiro':            {rank: 1, grupo: 'socio_estrangeiro',       fonte: 'receita_full.socioestrangeiro' },
    'cortex.sociopf':                           {rank: 0, grupo: 'socio_pf',                fonte: 'cortex'},
    'cortex.sociopj':                           {rank: 0, grupo: 'socio_pj',                fonte: 'cortex'},

    // ENDERECO
    'ipc.endereco':                             {rank: 0, grupo: 'endereco',                fonte: 'ipc' },
    'cortex.endereco':                          {rank: 0, grupo: 'endereco',                fonte: 'cortex' },
    'bd_receita.pf.endereco':                   {rank: 0, grupo: 'endereco',                fonte: 'bd_receita.pessoafisica' },
    'bd_receita.pj.endereco':                   {rank: 0, grupo: 'endereco',                fonte: 'bd_receita.pessoajuridica' },
    'receitanovo.pessoafisica.endereco':        {rank: 1, grupo: 'endereco',                fonte: 'receitanovo.pessoafisica' },
    'receitanovo.pessoajuridica.endereco':      {rank: 1, grupo: 'endereco',                fonte: 'receitanovo.pessoajuridica' },
    'ipva.endereco':                            {rank: 2, grupo: 'endereco',                fonte: 'ipva2019' },
    'renach.endereco':                          {rank: 2, grupo: 'endereco',                fonte: 'renach_2016_08' },
    'sispesquisa.enderecos':                    {rank: 2, grupo: 'endereco',                fonte: 'sispesquisa.enderecos' },
    'receita_full.pf.endereco':                 {rank: 3, grupo: 'endereco',                fonte: 'receita_full.pf' },
    'receita_full.pj.endereco':                 {rank: 3, grupo: 'endereco',                fonte: 'receita_full.pj' },
    'receita.pf.endereco':                      {rank: 4, grupo: 'endereco',                fonte: 'receita.pf' },
    'receita.pj.endereco':                      {rank: 4, grupo: 'endereco',                fonte: 'receita.pj' },
    'sispesquisa.veiculos_novo.endereco':       {rank: 4, grupo: 'endereco',                fonte: 'sispesquisa.veiculos_19_07_2017' },
    'vep.endereco':                             {rank: 0, grupo: 'endereco',                fonte: 'vep' },
    'credilink.pf.endereco':                    {rank: 0, grupo: 'endereco',                fonte: 'credilink' },
    'credilink.pj.endereco':                    {rank: 0, grupo: 'endereco',                fonte: 'credilink' },
    'cagepa.endereco':                          {rank: 0, grupo: 'endereco',                fonte: 'cagepa'},

    // VIZINHO
    'receitanovo.vizinho':                      {rank: 0, grupo: 'vizinho',                 fonte: 'receitanovo' },
    'energisa.vizinho':                         {rank: 0, grupo: 'vizinho',                 fonte: 'bd_energisa' },
    'credilink.pf.vizinho':                     {rank: 0, grupo: 'vizinho',                 fonte: 'credilink.pf.vizinho' },
    'credilink.pj.vizinho':                     {rank: 0, grupo: 'vizinho',                 fonte: 'credilink.pj.vizinho' },


    // TELEFONE
    'ipc.telefone':                             {rank: 0, grupo: 'telefone',                fonte: 'ipc' },
    'cortex.telefone':                          {rank: 0, grupo: 'telefone',                fonte: 'cortex' },
    'sispesquisa.telefones':                    {rank: 0, grupo: 'telefone',                fonte: 'sispesquisa.telefones' },
    'bd_receita.pf.telefone':                   {rank: 0, grupo: 'telefone',                fonte: 'bd_receita.pf' },
    'credilink.pf.telefone':                    {rank: 1, grupo: 'telefone',                fonte: 'credilink.pf.telefone' },
    'bd_receita.socio.telefone':                {rank: 0, grupo: 'telefone',                fonte: 'bd_receita.socio' },
    'bd_receita.pj.telefone':                   {rank: 0, grupo: 'telefone',                fonte: 'bd_receita.pj' },
    'credilink.pj.telefone':                    {rank: 1, grupo: 'telefone',                fonte: 'redilink.pj' },
    'receita_full.pf.telefone':                 {rank: 1, grupo: 'telefone',                fonte: 'receita_full.pf' },
    'receita_full.pj.telefone':                 {rank: 1, grupo: 'telefone',                fonte: 'receita_full.pj' },
    'receita.pf.telefone':                      {rank: 2, grupo: 'telefone',                fonte: 'receita.pf' },
    'receita.pj.telefone':                      {rank: 2, grupo: 'telefone',                fonte: 'receita.pj' },
    'vep.telefone':                             {rank: 0, grupo: 'telefone',                fonte: 'vep.telefone' },
    'dna.pj.telefone':                          {rank: 0, grupo: 'telefone',                fonte: 'dna.pj' },
    'cagepa.telefone':                          {rank: 0, grupo: 'telefone',                fonte: 'cagepa'},

    // PRESO
    'sispesquisa.prisional.preso':              {rank: 0,  grupo: 'preso',                  fonte: 'sispesquisa.prisional' },
    'sispesquisa.dbo.tbl_prontuarios':          {rank: 0,  grupo: 'preso',                  fonte: 'sispesquisa.dbo.tbl_prontuarios' },
    'sisdepen':                                 {rank: 0,  grupo: 'preso',                  fonte: 'sisdepen' },

    // FILIACAO
    'filiacao':                                 {rank: 0, grupo: 'filiacao',                fonte: 'filiados_pb' },

    // BENEFICIOS
    'bolsa_familia':                            {rank: 0, grupo: 'beneficio',               fonte: 'bolsafamilia' },
    'cartao_alimentacao_pb':                    {rank: 0, grupo: 'beneficio',               fonte: 'bd_cartao_alimentacao_pb' },
    'transparencia_beneficio':                  {rank: 0, grupo: 'beneficio',               fonte: 'transparencia_federal' },

    // EMPREGADO
    'empregador.rais':                          {rank: 0, grupo: 'empregador',              fonte: 'rais' },

    // CONSELHO
    'vep.advogado':                             {rank: 0, grupo: 'conselho',                fonte: 'vep' },

    // CONDENACOES

    // PROCESSO
    'tjpb.processo':                            {rank: 0, grupo: 'processo',                fonte: 'tjpb' },
    'vep.processo':                             {rank: 0, grupo: 'processo',                fonte: 'vep' },
    'condenacao':                               {rank: 0, grupo: 'processo',                fonte: 'trf5.tre' },
    'transparencia_processo':                   {rank: 0, grupo: 'processo',                fonte: 'transparencia_federal' },
    'tcu.processo':                             {rank: 0, grupo: 'processo',                fonte: 'tcu' },

    // MANDADO
    'cnj.bnmp.mandado':                         {rank: 0, grupo: 'mandado',                 fonte: 'cnj.bnmp' },
    'cortex.bnmp.mandado':                      {rank: 0, grupo: 'mandado',                 fonte: 'cortex.bnmp'},

    // CONTADOR
    'bd_receita.contador':                      {rank: 0, grupo: 'contador',                fonte: 'bd_receita.contador' },
    'receita_full.contador':                    {rank: 0, grupo: 'contador',                fonte: 'receita_full.contador' },
    'cortex.contador':                          {rank: 0, grupo: 'contador',                fonte: 'cortex.contador' },

    // TIPOLOGIA
    'tipologias.pf':                            {rank: 0, grupo: 'tipologia_pf',            fonte: 'tipologias.matriz_completa_pf' },
    'tipologias.pj':                            {rank: 0, grupo: 'tipologia_pj',            fonte: 'tipologias.matriz_completa_pj' },
    'tipologias.cacafantasmas':                 {rank: 0, grupo: 'tipologia',               fonte: 'tipologias' },
    'tipologias.tce':                           {rank: 0, grupo: 'tipologia_tce',           fonte: 'tipologias_tce'},

    // GEOCOORDENADAS
    'nfce_mapa_calor':                          {rank: 0, grupo: 'geocoordenadas',          fonte: 'nfce_mapa_calor.geocoordenadas' },

    // OBITO
    'sisobi':                                   {rank: 0, grupo: 'obito',                   fonte: 'bd_sisobi' },
    'cortex.obito':                             {rank: 1, grupo: 'obito',                   fonte: 'cortex'},
    'credilink.obito':                          {rank: 2, grupo: 'obito',                   fonte: 'credilink'},

    // QUADRO SOCIETARIO
    'cortex.quadrosocietario':                  {rank: 0, grupo: 'historico_quadro_societario', fonte: 'cortex' },
    'bd_receita.socio.historico':               {rank: 1, grupo: 'historico_quadro_societario', fonte: 'bd_receita.socio' },
    'historico_quadro_societario.cne':          {rank: 2, grupo: 'historico_quadro_societario', fonte: 'cne.dbo.procedures' },

    // SERVIDOR
    'sagres_municipal.v_folhapagamento':        {rank: 0, grupo: 'servidor_municipal',      fonte: 'sagres_municipal.v_folhapagamento' },
    'sagres_estadual.vw_folha':                 {rank: 0, grupo: 'servidor_estadual',       fonte: 'sagres_estadual.vw_folha' },

    'transparencia.servidor':                   {rank: 0, grupo: 'servidor_federal',        fonte: 'transparencia' },
    'sispesquisa.servidores_federais':          {rank: 0, grupo: 'servidor_federal',        fonte: 'sispesquisa.servidores_federais' },
    'sispesquisa.servidores_federais_nordeste': {rank: 0, grupo: 'servidor_federal',        fonte: 'sispesquisa.servidores_federais_nordeste' },

    // FOLHA
    'tcepb.folha':                              {rank: 0, grupo: 'folhapagamento',          fonte: 'bd_tcepb' },

    // LICITACAO
    'tcepb.licitacao':                          {rank: 0, grupo: 'licitacao',               fonte: 'bd_tcepb' },

    // CONTRATO
    'tcepb.contrato':                           {rank: 0, grupo: 'contrato',               fonte: 'bd_tcepb' },

    // ADITIVO
    'tcepb.aditivo':                            {rank: 0, grupo: 'aditivo',                 fonte: 'bd_tcepb' },

    // EMPENHOS
    'tcepb.empenhos.municipal':                 {rank: 0, grupo: 'empenho_municipal',       fonte: 'bd_tcepb' },
    'tcepb.empenhos.estadual':                  {rank: 0, grupo: 'empenho_estadual',        fonte: 'bd_tcepb' },

    // VEICULO
    'cortex.veiculo':                           {rank: 0, grupo: 'veiculo',                 fonte: 'cortex' },
    'ipva2019':                                 {rank: 1, grupo: 'veiculo',                 fonte: 'IPVA_SEFAZPB' },
    'bd_detran.veiculo':                        {rank: 2, grupo: 'veiculo',                 fonte: 'bd_detran' },
    'renavam_2020':                             {rank: 3, grupo: 'veiculo',                 fonte: 'renavam_2020' },
    'sispesquisa.veiculos_novo':                {rank: 4, grupo: 'veiculo',                 fonte: 'sispesquisa.veiculos_19_07_2017' },
    'sispesquisa.veiculos':                     {rank: 5, grupo: 'veiculo',                 fonte: 'sispesquisa.veiculos' },

    // AERONAVE
    'bd_rab':                                   {rank: 0, grupo: 'aeronave',                fonte: 'bd_rab' },

    // EMBARCACAO
    'cortex.embarcacao':                        {rank: 0, grupo: 'embarcacao',              fonte: 'cortex' },
    'bd_embarcacoes.re':                        {rank: 1, grupo: 'embarcacao',              fonte: 'bd_embarcacoes.embarcacoes_fisco_estadual' },
    'bd_embarcacoes.embarcacoes':               {rank: 1, grupo: 'embarcacao',              fonte: 'bd_embarcacoes.embarcacoes' },

    // IMOVEL
    'itbi':                                     {rank: 0, grupo: 'imovel',                  fonte: 'itbi' },

    // ELEITORAL
    'bd_tse.eleitoral':                         {rank: 0, grupo: 'eleitoral',               fonte: 'bd_tse.eleitoral' },

    // LOG
    'sispesquisa.logs':                         {rank: 0, grupo: 'log',                     fonte: 'sispesquisa.logs'},

    // USUARIO
    'sispesquisa.usuario':                      {rank: 0, grupo: 'usuario',                 fonte: 'sispesquisa.usuario'},

    // USUARIO
    'sispesquisa.aplicativo':                   {rank: 0, grupo: 'aplicativo',              fonte: 'sispesquisa.aplicativo'},

    // PRE USUARIO
    'bd_pandora.pessoa_usuario':                {rank:0, grupo: 'pessoa_usuario',           fonte: 'bd_pandora.pessoa_usuario'},
    'sispesquisa.cadastro_usuario.preusuario':  {rank:0, grupo: 'preusuario',               fonte: 'sispesquisa.cadastro_usuario'},

    // REQUISICAO
    'integra.requisicoes':                      {rank:0, grupo: 'requisicao',               fonte: 'integra.requisicoes'},

    // RIF
    'rif':                                      {rank:0, grupo: 'rif',                      fonte: 'sispesquisa.rif'},

    // UTILS
    'utils':                                    {rank:0, grupo: 'utils',                    fonte: 'utils'},
    'geocoordenadas.google':                    {rank:0, grupo: 'geocoordenadas',           fonte: 'google.maps'},

    // OPERACOES
    'operacoes':                                {rank:0, grupo: 'operacao',                 fonte: 'sispesquisa.operacao'},

    // BANCARIO
    'simba.top':                                {rank:0, grupo: 'bancario',                 fonte: 'bd_simba'},

    // VIRTUAL
    // // EMAIL
    'vep.email':                                {rank: 0, grupo: 'virtual',                 fonte: 'vep.email'},
    'sispesquisa.email':                        {rank: 0, grupo: 'virtual',                 fonte: 'sispesquisa.email'},
    'bd_receita.email':                         {rank: 0, grupo: 'virtual',                 fonte: 'bd_receita'},
    'dna.pj.email':                             {rank: 0, grupo: 'virtual',                 fonte: 'dna.pj'},
    'credilink.pf.email':                       {rank: 1, grupo: 'virtual',                 fonte: 'credilink.pf.email' },
    'credilink.pj.email':                       {rank: 1, grupo: 'virtual',                 fonte: 'credilink.pj.email' },
    'cagepa.email':                             {rank: 0, grupo: 'virtual',                 fonte: 'cagepa'},

    // CRAWLERS
    'crawlers':                                             {rank:0, grupo: 'crawler',                                              fonte: 'pandora-crawlers'},
    'pandora.crawlers':                                     {rank:0, grupo: 'crawler',                                              fonte: 'pandora-crawlers'},
    'crawler.transparenciafederal':                         {rank:0, grupo: 'crawler',                                              fonte: 'transparencia'},
    'crawler.tcu':                                          {rank:0, grupo: 'crawler',                                              fonte: 'tcu'},

    'boletim_ocorrencia':                                   {rank: 0, grupo: 'boletim_ocorrencia',                                  fonte: 'codata'},

    //sefaz
    'bd_sefaz':                                             {rank:0, grupo: 'sefaz',                                                fonte: 'bd_sefaz.notafiscal'},
    'sefaz_outros_itens':                                   {rank:0, grupo: 'outros_itens_nf',                                      fonte: 'bd_sefaz.notafiscal'},
    'sefaz_itens_produtos':                                 {rank:0, grupo: 'itens_mesmo_produto',                                  fonte: 'bd_sefaz.notafiscal'},
    'sefaz_item_detalhado':                                 {rank:0, grupo: 'item_detalhado',                                       fonte: 'bd_sefaz.notafiscal'},
    'sefaz_itens_discrepantes_empresa_destinatario_item':   {rank:0, grupo: 'itens_discrepantes_mesma_empresa_destinatario_item',   fonte: 'bd_sefaz.notafiscal'},
    'sefaz_top_fornecedores':                               {rank:0, grupo: 'top_fornecedores',                                     fonte: 'bd_sefaz.notafiscal'},
    'sefaz_nome_produtos':                                  {rank:0, grupo: 'nome_produtos_nf',                                     fonte: 'bd_sefaz.notafiscal'},

    // PRONTUARIO
    'lince.prontuarios':                                    {rank: 0, grupo: 'prontuarios',                                         fonte: 'lince'},

    // ORCRIM
    'lince.orcrins':                                        {rank: 0, grupo: 'orcrins',                                             fonte: 'lince'},
    'bd_siapenpb':                                          {rank: 0, grupo: 'siapenpb',                                            fonte: 'bd_siapenpb.infopen'},
    'bd_orcrim':                                            {rank: 0, grupo: 'hiri',                                                fonte: 'bd_orcrim'},

    // AMADOR
    'cortex.amador':                                        {rank: 0, grupo: 'amador',                                              fonte: 'amador'},

    // TCE
    'tce':                                                  {rank: 0, grupo: 'tce',                                                 fonte: 'tce'},

    // SASP
    'sasp':                                                 {rank: 0, grupo: 'sasp',                                                fonte: 'sasp'},

    // SADEP
    'sadep':                                                {rank: 0, grupo: 'sadep',                                               fonte: 'sadep'},

    // ALERTAS
    'alertas.orcrim':                                       {rank: 1, grupo: 'alertas',                                             fonte: 'orcrim'},
    'alertas.socio_orcrim':                                 {rank: 0, grupo: 'alertas',                                             fonte: 'orcrim'},
    'alertas.pep':                                          {rank: 0, grupo: 'alertas',                                             fonte: 'pep'},
    'alertas.ficha_suja':                                   {rank: 0, grupo: 'alertas',                                             fonte: 'ficha_suja'},

    // ZOOM
    'zoom':                                                 {rank: 0, grupo: 'zoom',                                                fonte: 'pandora.zoom'},

    // FICHA SUJA
    'ficha_suja':                                           {rank: 0, grupo: 'ficha_suja',                                          fonte: 'bd_ficha_suja'},
    'pep':                                                  {rank: 0, grupo: 'pep',                                                 fonte: 'bd_pep'}
}

export let LOG_SECOES = {
    SISTEMA: {
        NOME: 'SISTEMA',
        ITENS: {
            LOGS: {
                NOME: 'LOGS'
            },
            PESSOAUSUARIO: {
                NOME: 'PESSOAUSUARIO',
                CHAVES: {
                    ID: 'ID'
                }
            },
            USUARIO: {
                NOME: 'USUARIO',
                CHAVES: {
                    ID: 'ID'
                }
            }
        }
    },
    PESQUISA: {
        NOME: 'PESQUISA',
        ITENS: {
            PESSOA: {
                NOME: 'PESSOA',
                CHAVES: {
                    CPF     : 'CPF',
                    NOME    : 'NOME',
                    CNH     : 'CNH',
                    RG      : 'RG',
                    TITULO  : 'TITULO',
                    ENDERECO: 'ENDERECO',
                    TELEFONE: 'TELEFONE',
                    EMAIL   : 'EMAIL',
                    NOMEPAI : 'NOME DO PAI',
                    NOMEMAE : 'NOME DA MÃE',
                }
            },

            EMPRESA: {
                NOME: 'EMPRESA',
                CHAVES: {
                    CNPJ        : 'CNPJ',
                    RAZAOSOCIAL : 'RAZÃO SOCIAL',
                    NOMEFANTASIA: 'NOME FANTASIA',
                    EMAIL       : 'EMAIL',
                    ENDERECO    : 'ENDERECO',
                    TELEFONE    : 'TELEFONE',
                    NOMESOCIOPF : 'NOME DO SÓCIOPF',
                    CPFSOCIOPF  : 'CPF DO SÓCIOPF',
                    CNPJSOCIOPJ : 'CNPJ DO SÓCIOPJ',

                }
            },

            PRESO: {
                NOME: 'PRESO',
                CHAVES: {
                    CPF    : 'CPF',
                    CNC    : 'CNC',
                    VULGO  : 'VULGO',
                    NOME   : 'NOME',
                    NOMEMAE: 'NOME DA MÃE',
                }
            },

            TELEFONE: {
                NOME: 'TELEFONE',
                CHAVES: {
                    CPF        : 'CPF',
                    NOME       : 'NOME',
                    CNPJ       : 'CNPJ',
                    RAZAOSOCIAL: 'RAZÃO SOCIAL',
                    TELEFONE   : 'TELEFONE',
                }
            },

            VEICULO: {
                NOME: 'VEICULO',
                CHAVES: {
                    CPF    : 'CPF',
                    NOME   : 'NOME',
                    CNPJ   : 'CNPJ',
                    CHASSI : 'CHASSI',
                    PLACA  : 'PLACA',
                    RENAVAM: 'RENAVAM',
                }
            },

            ENDERECO: {
                NOME: 'ENDERECO',
                CHAVES: {
                    CPF        : 'CPF',
                    NOME       : 'NOME',
                    CNPJ       : 'CNPJ',
                    RAZAOSOCIAL: 'RAZÃO SOCIAL',
                    LOGRADOURO : 'LOGRADOURO',
                }
            },

            OBITO: {
                NOME: 'OBITO',
                CHAVES: {
                    CPF : 'CPF',
                    NOME: 'NOME',
                }
            },

            EMPENHO: {
                NOME: 'EMPENHO',
                CHAVES: {
                    CNPJ: 'CNPJ',
                    CPF: 'CPF',
                }
            },

            LICITACAO: {
                NOME: 'LICITACAO',
                CHAVES: {
                    CNPJ: 'CNPJ',
                    CPF: 'CPF',
                    DADOSLICITACAO: 'DADOSLICITACAO',
                }
            },

            TIPOLOGIA: {
                NOME: 'TIPOLOGIA',
                CHAVES: {
                    CPF : 'CPF',
                    CNPJ: 'CNPJ',
                    MUNICIPIO: 'MUNICIPIO',
                }
            },

            CONDENACAO: {
                NOME: 'CONDENACAO',
                CHAVES: {
                    CPF : 'CPF',
                }
            },

            GEOCOORDENADA: {
                NOME: 'GEOCOORDENADA',
                CHAVES: {
                    CPF : 'CPF',
                }
            },

            BOLETIMOCORRENCIA: {
                NOME: 'BOLETIMOCORRENCIA',
                CHAVES: {
                    CPF : 'CPF',
                }
            },

            FOLHAPAGAMENTO: {
                NOME: 'FOLHAPAGAMENTO',
                CHAVES: {
                    UGESTORA_MES_ANO: 'UGESTORA_MES_ANO',
                }
            },

            IMOVEL: {
                NOME: 'IMOVEL',
                CHAVES: {
                    CPF: 'CPF',
                    CNPJ: 'CNPJ',
                }
            },

            EMBARCACAO: {
                NOME: 'EMBARCACAO',
                CHAVES: {
                    CPF: 'CPF',
                    CNPJ: 'CNPJ',
                    EMBARCACAO: 'EMBARCACAO',
                    INSCRICAO: 'INSCRICAO'
                }
            },

            MANDADO: {
                NOME: 'MANDADO',
                CHAVES: {
                    CPF: 'CPF',
                }
            },

            INVESTIGADO: {
                NOME: 'INVESTIGADO',
                CHAVES: {
                    CPF: 'CPF',
                    CNPJ: 'CNPJ',
                    NOME: 'NOME',
                    RAZAOSOCIAL: 'RAZAO SOCIAL',
                    OPERACAO: 'NOME OPERACAO',
                    RG: 'RG',
                    ORCRIM: 'ORCRIM',
                    ALCUNHA: 'ALCUNHA'
                }
            },

            PRONTUARIO: {
                NOME: 'PRONTUARIO',
                CHAVES: {
                    CPF: 'CPF',
                    RG:  'RG',
                    NOME: 'NOME',
                    ALCUNHA: 'ALCUNHA',
                }
            },

            ORCRIM: {
                NOME: 'ORCRIM',
                CHAVES: {
                    ORCRIM: 'ORCRIM',
                    NOME: 'NOME',
                    CPF: 'CPF',
                    RG: 'RG'
                }
            },

            AMADOR: {
                NOME: 'AMADOR',
                CHAVES: {
                    CPF: 'CPF',
                    NOME: 'NOME',
                }
            },

            SASP: {
                NOME: 'SASP',
                CHAVES: {
                    CPF: 'CPF',
                    RG: 'RG',
                    NOME: 'NOME',
                    ALCUNHA: 'ALCUNHA'
                }
            }
        }
    },
    CADASTRO: {
        NOME: 'CADASTRO',
        ITENS: {
            TELEFONE: {
                NOME: 'TELEFONE',
                CHAVES: {
                    CPF: 'CPF'
                }
            },

            ENDERECO: {
                NOME: 'ENDERECO',
                CHAVES: {
                    CPF: 'CPF'
                }
            },
        }
    },
    APPS: {
        NOME: 'APPS',
        ITENS: {
            ARIEL: {
                NOME: 'ARIEL',
                CHAVES: {
                    FOTO: 'FOTO'
                }
            },
            SIMBA: {
                NOME: 'SIMBA',
                CHAVES: {
                    CPF: 'CPF',
                    CNPJ: 'CNPJ',
                }
            },
            RELACIONAMENTOS: {
                NOME: 'RELACIONAMENTOS',
                CHAVES: {
                    CPF     : 'CPF',
                    CNPJ    : 'CNPJ',
                    LISTA   : 'LISTA',
                    TELEFONE: 'TELEFONE',
                    UGESTORA: 'UGESTORA',
                    ENDERECO: 'ENDERECO',
                }
            },
            TIPORANK: {
                NOME: 'TIPORANK',
                CHAVES: {
                    MUNICIPIO: 'MUNICIPIO'
                }
            },
            INP: {
                NOME: 'INP',
                CHAVES: {
                    LOTACAO: 'LOTACAO',
                    CPF: 'CPF'
                }
            },
            CACAFANTASMAS: {
                NOME: 'CACAFANTASMAS',
                CHAVES: {
                    UGESTORA: 'UGESTORA',
                }
            },
            INTEGRA: {
                NOME: 'INTEGRA',
            },
            DNA: {
                NOME: 'DNA',
                CHAVES: {
                    CNPJ: 'CNPJ'
                }
            },
            PAINELCOVID: {
                NOME: 'PAINELCOVID',
                CHAVES: {
                    UF: 'UF'
                }
            },
            YELLOWPAGES: {
                NOME: 'YELLOWPAGES',
                CHAVES: {
                    CNPJ: 'CNPJ',
                    RAZAOSOCIAL: 'RAZAO SOCIAL',
                }
            },
            ONDEANDEI: {
                NOME: 'ONDEANDEI',
                CHAVES: {
                    PLACA: 'PLACA',
                }
            },
            SEFAZML: {
                NOME: 'SEFAZML',
                CHAVES:{
                    CNPJ: 'CNPJ'
                }
            },
            SEFAZRANK: {
                NOME: 'SEFAZRANK',
                CHAVES:{
                    CNPJ: 'CNPJ'
                }
            },
            SADEP: {
              NOME: 'SADEP',
              CHAVES: {
                UF: 'UF',
                CPF: 'CPF'
              }
            }
        }
    },
    OPERACOES: {
        NOME: 'OPERACOES',
        ITENS: {}
    },
    ANALISE  : {
        NOME: 'ANALISE',
        ITENS: {
            TCE: {
                NOME: 'TCE',
                CHAVES: {
                    DATA: 'DATA'
                }
            }
        }
    },
}

export let LOG_TIPOS_BUSCA = {
    INTEGRADA   : 'INTEGRADA',
    SIMPLIFICADA: 'SIMPLIFICADA',
    DETALHADA   : 'DETALHADA'
}

export let LOG_TIPOS = {
    SISTEMA:                               'SISTEMA',
    CADASTRO:                              'CADASTRO',
    RECADASTRO:                            'RECADASTRO',
    REMOVE:                                'REMOVE',
    PESQUISA:                              'PESQUISA',
    INTEGRA:                               'INTEGRA',
    TIPORANK:                              'TIPORANK',
    RELACIONAMENTOS:                       'RELACIONAMENTOS',
    CACAFANTASMAS:                         'CACA FANTASMAS',
    ARIEL:                                 'ARIEL',
    DNA:                                   'DNA',
    SADEP:                                 'SADEP',
    REGISTRO_NAO_ENCONTRADO:               'REGISTRO NAO ENCONTRADO',
    TENTATIVA_CONSULTA:                    'TENTATIVA DE CONSULTA',
    TENTATIVA_CONSULTA_SEM_PERFIL:         'TENTATIVA DE CONSULTA SEM PERFIL DE ACESSO',
    TENTATIVA_INTEGRA_SEM_PERFIL:          'TENTATIVA DE USO DO INTEGRA SEM PERFIL DE ACESSO',
    TENTATIVA_CONSULTA_ADMIN_SEM_PERFIL:   'TENTATIVA DE CONSULTA ROTA ADMIN SEM PERFIL DE ACESSO',
    TENTATIVA_CONSULTA_HASH_INVALIDO:      'TENTATIVA DE CONSULTA - HASH INVALIDO',
    LOGIN:                                 'LOGIN',
    TENTATIVA_LOGIN:                       'TENTATIVA DE LOGIN',
    LOGIN_EXTERNO:                         'LOGIN EXTERNO',
    TENTATIVA_LOGIN_EXTERNO:               'TENTATIVA DE LOGIN EXTERNO',
    CREATE_CADASTRO_USUARIO_EXTERNO:       'CADASTRO EXTERNO DE CADASTRO_USUÁRIO',
    CREATE_CADASTRO_USUARIO:               'CADASTRO DE CADASTRO_USUÁRIO',
    TENTATIVA_CADASTRO:                    'TENTATIVA DE CADASTRO',
    TENTATIVA_RECADASTRO:                  'TENTATIVA DE RECADASTRO',
    CREATE_USUARIO_EXTERNO:                'CADASTRO EXTERNO DE USUÁRIO',
}

export let LOG_CODES = {
    TIPO_SISTEMA:                               'SISTEMA',
    TIPO_PESQUISA:                              'PESQUISA',
    TIPO_INSERCAO:                              'INSERCAO',

    TIPO_INTEGRA:                               'INTEGRA',
    TIPO_TIPORANK:                              'TIPORANK',
    TIPO_RELACIONAMENTOS:                       'RELACIONAMENTOS',
    TIPO_CACAFANTASMAS:                         'CACA FANTASMAS',
    TIPO_ARIEL:                                 'ARIEL',
    TIPO_DNA:                                   'DNA',
    TIPO_SADEP:                                 'SADEP',

    TIPO_REGISTRO_NAO_ENCONTRADO:               'REGISTRO NAO ENCONTRADO',

    TIPO_TENTATIVA_CONSULTA:                    'TENTATIVA DE CONSULTA',
    TIPO_TENTATIVA_CONSULTA_SEM_PERFIL:         'TENTATIVA DE CONSULTA SEM PERFIL DE ACESSO',
    TIPO_TENTATIVA_INTEGRA_SEM_PERFIL:          'TENTATIVA DE USO DO INTEGRA SEM PERFIL DE ACESSO',
    TIPO_TENTATIVA_CONSULTA_ADMIN_SEM_PERFIL:   'TENTATIVA DE CONSULTA ROTA ADMIN SEM PERFIL DE ACESSO',
    TIPO_TENTATIVA_CONSULTA_HASH_INVALIDO:      'TENTATIVA DE CONSULTA - HASH INVALIDO',

    TIPO_LOGIN:                                 'LOGIN',
    TIPO_TENTATIVA_LOGIN:                       'TENTATIVA DE LOGIN',
    TIPO_LOGIN_EXTERNO:                         'LOGIN EXTERNO',
    TIPO_TENTATIVA_LOGIN_EXTERNO:               'TENTATIVA DE LOGIN EXTERNO',

    TIPO_CREATE_CADASTRO_USUARIO_EXTERNO:       'CADASTRO EXTERNO DE CADASTRO_USUÁRIO',
    TIPO_CREATE_CADASTRO_USUARIO:               'CADASTRO DE CADASTRO_USUÁRIO',
    TIPO_TENTATIVA_CREATE_CADASTRO_USUARIO:     'TENTATIVA DE CADASTRO DE CADASTRO_USUÁRIO',
    TIPO_CREATE_USUARIO_EXTERNO:                'CADASTRO EXTERNO DE USUÁRIO',
}

export let LOG_MSGS = {
    USUARIO_LISTA_USUARIOS:                     'LISTA USUÁRIOS',
    USUARIO_GET_PERMISSAO:                      'PEGA PERMISSÃO USUÁRIO',
    USUARIO_GET_USUARIO:                        'PEGA USUÁRIO',
    USUARIO_ATUALIZA_USUARIO:                   'ATUALIZA USUÁRIO',
    USUARIO_REMOVE_USUARIO:                     'REMOVE USUÁRIO',
    USUARIO_ATUALIZA_SENHA:                     'ATUALIZA SENHA',
    USUARIO_REDEFINIR_SENHA:                    'REDEFINIR SENHA',
    USUARIO_LISTA_CONTROLE_ACESSO:              'LISTA CONTROLE DE ACESSOS',
    USUARIO_ATUALIZA_CONTROLE_ACESSO:           'ATUALIZA CONTROLE DE ACESSOS',

    CADASTRO_USUARIO_LISTA_USUARIOS:            'LISTA PREUSUÁRIOS',
    CADASTRO_USUARIO_LISTA_USUARIOS_INATIVOS:   'LISTA PREUSUÁRIOS INATIVOS',
    CADASTRO_USUARIO_ATIVAR_USUARIO:            'ATIVAR PREUSUÁRIO',
    CADASTRO_USUARIO_REMOVE_USUARIO:            'REMOVE PREUSUÁRIO',
    CADASTRO_USUARIO_RECADASTRAMENTO_USUARIO:   'ATIVA RECADASTRAMENTO PREUSUÁRIO',
    PESSOA_USUARIO_CADASTRO:                    'CADASTRO PESSOA USUÁRIO',
    PESSOA_USUARIO_RECADASTRO:                  'RECADASTRO PESSOA USUÁRIO',

    PESSOA_DETALHADO_CPF:                       'PESSOA - BUSCA DETALHADA POR CPF',
    PESSOA_SIMPLIFICADO_CPF:                    'PESSOA - BUSCA SIMPLIFICADA POR CPF',
    PESSOA_SIMPLIFICADO_NOME:                   'PESSOA - BUSCA SIMPLIFICADA POR NOME',
    PESSOA_SIMPLIFICADO_CNH:                    'PESSOA - BUSCA SIMPLIFICADA POR CNH',
    PESSOA_SIMPLIFICADO_TITULO:                 'PESSOA - BUSCA SIMPLIFICADA POR TITULO',
    PESSOA_SIMPLIFICADO_RG:                     'PESSOA - BUSCA SIMPLIFICADA POR RG',
    PESSOA_SIMPLIFICADO_NOME_PAI:               'PESSOA - BUSCA SIMPLIFICADA POR NOME DO PAI',
    PESSOA_SIMPLIFICADO_NOME_MAE:               'PESSOA - BUSCA SIMPLIFICADA POR NOME DA MÃE',
    PESSOA_SIMPLIFICADO_ENDERECO:               'PESSOA - BUSCA SIMPLIFICADA POR ENDERECO',
    PESSOA_SIMPLIFICADO_TELEFONE:               'PESSOA - BUSCA SIMPLIFICADA POR TELEFONE',
    PESSOA_SIMPLIFICADO_EMAIL:                  'PESSOA - BUSCA SIMPLIFICADA POR EMAIL',
    PESSOA_INTEGRADO_CPF:                       'PESSOA - BUSCA INTEGRADA POR CPF',

    EMPRESA_DETALHADO_CNPJ:                     'EMPRESA - BUSCA DETALHADA POR CNPJ',
    EMPRESA_SIMPLIFICADO_CNPJ:                  'EMPRESA - BUSCA SIMPLIFICADA POR CNPJ',
    EMPRESA_SIMPLIFICADO_RAZAO_SOCIAL:          'EMPRESA - BUSCA SIMPLIFICADA POR RAZÃO SOCIAL',
    EMPRESA_SIMPLIFICADO_NOME_FANTASIA:         'EMPRESA - BUSCA SIMPLIFICADA POR NOME FANTASIA',
    EMPRESA_SIMPLIFICADO_EMAIL:                 'EMPRESA - BUSCA SIMPLIFICADA POR EMAIL',
    EMPRESA_SIMPLIFICADO_ENDERECO:              'EMPRESA - BUSCA SIMPLIFICADA POR ENDERECO',
    EMPRESA_SIMPLIFICADO_TELEFONE:              'EMPRESA - BUSCA SIMPLIFICADA POR TELEFONE',
    EMPRESA_SIMPLIFICADO_SOCIOPF_NOME:          'EMPRESA - BUSCA SIMPLIFICADA POR NOME DO SÓCIOPF',
    EMPRESA_SIMPLIFICADO_SOCIOPF_CPF:           'EMPRESA - BUSCA SIMPLIFICADA POR CPF DO SÓCIOPF',
    EMPRESA_SIMPLIFICADO_SOCIOPJ_CNPJ:          'EMPRESA - BUSCA SIMPLIFICADA POR CNPJ DO SÓCIOPJ',
    EMPRESA_INTEGRADO_CNPJ:                     'EMPRESA - BUSCA INTEGRADA POR CNPJ',

    LOG_GET_LOGS:                               'LISTA LOGS',

    PRESO_DETALHADO_CPF:                        'PRESO - BUSCA DETALHADA POR CPF',
    PRESO_DETALHADO_CNC:                        'PRESO - BUSCA DETALHADA POR CNC',
    PRESO_SIMPLIFICADO_CPF:                     'PRESO - BUSCA SIMPLIFICADA POR CPF',
    PRESO_SIMPLIFICADO_CNC:                     'PRESO - BUSCA SIMPLIFICADA POR CNC',
    PRESO_SIMPLIFICADO_VULGO:                   'PRESO - BUSCA SIMPLIFICADA POR VULGO',
    PRESO_SIMPLIFICADO_NOME:                    'PRESO - BUSCA SIMPLIFICADA POR NOME',
    PRESO_SIMPLIFICADO_NOME_MAE:                'PRESO - BUSCA SIMPLIFICADA POR NOME DA MÃE',

    CACAFANTASMAS_UGESTORA:                     'CACAFANTASMAS - BUSCA POR UNIDADE GESTORA',

    ARIEL_FOTO:                                 'ARIEL - BUSCA PESSOA POR FOTO',

    DNA_CNPJ:                                   'DNA - BUSCA POR CNPJ',

    INP_UGESTORA:                               'INP - BUSCA POR UNIDADE GESTORA',
    INP_CPF:                                    'INP - BUSCA POR CPF',

    RELACIONAMENTO_LISTA:                       'RELACIONAMENTOS - BUSCA POR LISTA',
    RELACIONAMENTO_CPF:                         'RELACIONAMENTOS - BUSCA POR CPF',
    RELACIONAMENTO_CNPJ:                        'RELACIONAMENTOS - BUSCA POR CNPJ',
    RELACIONAMENTO_ENDERECO:                    'RELACIONAMENTOS - BUSCA POR ENDERECO',
    RELACIONAMENTO_TELEFONE:                    'RELACIONAMENTOS - BUSCA POR TELEFONE',
    RELACIONAMENTO_CDUGESTORA:                  'RELACIONAMENTOS - BUSCA POR CDUGESTORA',

    SOCIO_SIMPLIFICADO_CNPJ:                    'SOCIO - BUSCA SIMPLIFICADA POR CNPJ',

    MAPACONSUMO_GEOCOORDENADAS_CPF:             'MAPACONSUMO - BUSCA GEOCOORDENADAS POR CPF',

    RISCO_MPPB_QUESTAO:                         'RISCO MPPB - BUSCA QUESTOES POR NUMERO',
    RISCO_MPPB_INSERE_RESPOSTA:                 'RISCO MPPB - CADASTRA RESPOSTA',

    FOLHAPAGAMENTO_MUNICIPAL_CDUGESTORA:        'FOLHA DE PAGAMENTO MUNICIPAL - BUSCA SIMPLIFICADA POR CDUGESTORA',
    FOLHAPAGAMENTO_ESTADUAL_UGESTORA:           'FOLHA DE PAGAMENTO ESTADUAL - BUSCA SIMPLIFICADA POR UGESTORA',

    TELEFONE_SIMPLIFICADO_CPF:                  'TELEFONE - BUSCA SIMPLIFICADA POR CPF',
    TELEFONE_SIMPLIFICADO_CNPJ:                 'TELEFONE - BUSCA SIMPLIFICADA POR CNPJ',
    TELEFONE_SIMPLIFICADO_NOME:                 'TELEFONE - BUSCA SIMPLIFICADA POR NOME',
    TELEFONE_SIMPLIFICADO_RAZAO_SOCIAL:         'TELEFONE - BUSCA SIMPLIFICADA POR RAZÃO SOCIAL',
    TELEFONE_SIMPLIFICADO_TELEFONE:             'TELEFONE - BUSCA SIMPLIFICADA POR TELEFONE',
    TELEFONE_BUSCA_PROFUNDA_TELEFONE:           'TELEFONE - BUSCA PROFUNDA POR TELEFONE',

    VEICULO_DETALHADO_CNPJ:                     'VEICULO - BUSCA DETALHADA POR CNPJ',
    VEICULO_DETALHADO_CPF:                      'VEICULO - BUSCA DETALHADA POR CPF',
    VEICULO_DETALHADO_NOME:                     'VEICULO - BUSCA DETALHADA POR NOME',
    VEICULO_DETALHADO_CHASSI:                   'VEICULO - BUSCA DETALHADA POR CHASSI',
    VEICULO_DETALHADO_PLACA:                    'VEICULO - BUSCA DETALHADA POR PLACA',
    VEICULO_DETALHADO_RENAVAM:                  'VEICULO - BUSCA DETALHADA POR RENAVAM',

    OBITO_DETALHADO_CPF:                        'OBITO - BUSCA DETALHADA POR CPF',
    OBITO_SIMPLIFICADO_NOME:                    'OBITO - BUSCA SIMPLIFICADA POR NOME',
    OBITO_SIMPLIFICADO_CPF:                     'OBITO - BUSCA SIMPLIFICADA POR CPF',

    CONDENACAO_CPF:                             'CONDENAÇÃO - BUSCA SIMPLIFICADA POR CPF',

    EMPENHO_MUNICIPAL_CNPJ:                     'EMPENHO - BUSCA DETALHADA POR CNPJ',

    LICITACAO_MUNICIPAL_CNPJ:                   'LICITAÇÃO - BUSCA DETALHADA POR CNPJ',

    MANDADO_DETALHADO_CPF:                      'MANDADO - BUSCA DETALHADA POR CPF',
    MANDADO_SIMPLIFICADO_CPF:                   'MANDADO - BUSCA SIMPLIFICADA POR CPF',
    MANDADO_SIMPLIFICADO_NOME:                  'MANDADO - BUSCA SIMPLIFICADA POR NOME',
    MANDADO_SIMPLIFICADO_RG:                    'MANDADO - BUSCA SIMPLIFICADA POR RG',

    ENDERECO_SIMPLIFICADO_CNPJ:                 'ENDERECO - BUSCA SIMPLIFICADA POR CNPJ',
    ENDERECO_SIMPLIFICADO_CPF:                  'ENDERECO - BUSCA SIMPLIFICADA POR CPF',
    ENDERECO_SIMPLIFICADO_NOME:                 'ENDERECO - BUSCA SIMPLIFICADA POR NOME',
    ENDERECO_SIMPLIFICADO_RAZAO_SOCIAL:         'ENDERECO - BUSCA SIMPLIFICADA POR RAZÃO SOCIAL',

    TIPOLOGIA_SIMPLIFICADO_CPF:                 'TIPOLOGIA - BUSCA SIMPLIFICADA POR CPF',
    TIPOLOGIA_SIMPLIFICADO_CNPJ:                'TIPOLOGIA - BUSCA SIMPLIFICADA POR CNPJ',
    TIPOLOGIA_SIMPLIFICADO_MUNICIPIO:           'TIPOLOGIA - BUSCA SIMPLIFICADA POR MUNICIPIO',

    INTEGRA_CADASTRA_REQUISICAO:                'CADASTRA REQUISIÇÃO',
    INTEGRA_LISTA_REQUISICOES:                  'LISTA REQUISIÇÕES',
    INTEGRA_FINALIZA_REQUISICAO:                'FINALIZA REQUISIÇÃO',
    INTEGRA_DOWNLOAD_REQUISICAO:                'DOWNLOAD REQUISIÇÃO',

    BOLETIM_OCORRENCIA_NOME:                    'BOLETIM OCORRÊNCIA - CONSULTA PARTE POR NOME',
    BOLETIM_OCORRENCIA_CPF:                     'BOLETIM OCORRÊNCIA - CONSULTA PARTE POR CPF',
    BOLETIM_OCORRENCIA_DADOS_OCORRENCIA:        'BOLETIM OCORRÊNCIA - CONSULTA DADOS DA OCORRÊNCIA',
    BOLETIM_OCORRENCIA_DADOS_DELEGACIA:         'BOLETIM OCORRÊNCIA - CONSULTA DADOS DA DELEGACIA',

    PRONTUARIO_SIMPLIFICADO_CPF:                'PRONTUARIO - BUSCA POR CPF',
    PRONTUARIO_DETALHADO_CPF:                   'PRONTUARIO - BUSCA POR CPF',
    PRONTUARIO_DETALHADO_RG:                    'PRONTUARIO - BUSCA POR RG',
    PRONTUARIO_DETALHADO_ORCRIM:                'PRONTUARIO - BUSCA POR ORCRIM',
    PRONTUARIO_SIMPLIFICADO_NOME:               'PRONTUARIO - BUSCA POR NOME',
    PRONTUARIO_DETALHADO_NOME:                  'PRONTUARIO - BUSCA POR NOME',

    ORCRIM_DETALHADO:                           'ORCRIM - BUSCA ORCRIM',

    AMADOR_DETALHADO_CPF:                       'AMADOR - BUSCA POR CPF',
    AMADOR_SIMPLIFICADO_CPF:                    'AMADOR - BUSCA POR CPF SIMPLIFICADO',
    AMADOR_DETALHADO_NOME:                      'AMADOR - BUSCA POR NOME',
    AMADOR_SIMPLIFICADO_NOME:                   'AMADOR - BUSCA POR NOME SIMPLIFICADO',

    SADEP_MANDADOS_UF:                          'SADEP - BUSCA MANDADOS POR UF',
    SADEP_DETALHA_MANDADOS:                     'SADEP - DETALHA MANDADOS'
}
