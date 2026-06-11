USE BD_PANDORA

DROP TABLE IF EXISTS dbo.log
DROP TABLE IF EXISTS dbo.pessoa
DROP TABLE IF EXISTS dbo.perfil
DROP TABLE IF EXISTS dbo.grupo
DROP TABLE IF EXISTS dbo.usuario
DROP TABLE IF EXISTS dbo.secao
DROP TABLE IF EXISTS dbo.item
DROP TABLE IF EXISTS dbo.auth_aplicativos

DROP TABLE IF EXISTS dbo.usuario_grupo
DROP TABLE IF EXISTS dbo.perfil_item
DROP TABLE IF EXISTS dbo.usuario_item

DROP TRIGGER IF EXISTS dbo.TRG_usuario_update
DROP TRIGGER IF EXISTS dbo.TRG_pessoa_update


CREATE TABLE dbo.log
(
    id           INT PRIMARY KEY IDENTITY (1,1),
    ip           VARCHAR(16),
    usuario      VARCHAR(50),
    secao        VARCHAR(100),
    item         VARCHAR(100),
    chave        VARCHAR(100),
    valor        VARCHAR(50),
    tipo         VARCHAR(50),
    code         VARCHAR(50),
    mensagem     VARCHAR(500),
    url          VARCHAR(255),
    user_agent   VARCHAR(255),
    os           VARCHAR(50),
    browser      VARCHAR(50),
    device       VARCHAR(50),
    processo     VARCHAR(50),
    data_hora    DATETIME DEFAULT(GETDATE())
)

CREATE INDEX IDX_usuario ON dbo.log(usuario)
CREATE INDEX IDX_secao ON dbo.log(secao)
CREATE INDEX IDX_item ON dbo.log(item)
CREATE INDEX IDX_chave ON dbo.log(chave)

CREATE TABLE dbo.pessoa
(
    id               INT PRIMARY KEY IDENTITY (1,1),
    nome             VARCHAR(255),
    cpf              CHAR(11) UNIQUE,
    identidade       VARCHAR(16),
    org_emissor      VARCHAR(16),
    uf_org_emissor   CHAR(2),
    matricula        VARCHAR(16),
    titularidade     VARCHAR(255),
    lotacao          VARCHAR(255),
    email            VARCHAR(100) UNIQUE,
    telefone         VARCHAR(32),
    data_cadastro    DATETIME DEFAULT GETDATE(),
    data_atualizacao DATETIME DEFAULT GETDATE(),
    ativado          BIT DEFAULT 0
)

CREATE TABLE dbo.perfil
(
    id        INT PRIMARY KEY IDENTITY (1,1),
    descricao VARCHAR(255) UNIQUE
)

CREATE TABLE dbo.grupo
(
    id        INT PRIMARY KEY IDENTITY (1,1),
    descricao VARCHAR(255) UNIQUE
)

CREATE TABLE dbo.usuario
(
    id                  INT PRIMARY KEY IDENTITY (1,1),
    id_pessoa           INT FOREIGN KEY REFERENCES pessoa(id),
    id_usuario_ativador INT,
    id_perfil           INT FOREIGN KEY REFERENCES perfil(id),
    ativo               BIT,
    acesso              VARCHAR(16),
    login               VARCHAR(100) UNIQUE,
    senha               VARCHAR(128),
    proximo_logon       BIT,
    necessita_processo  BIT,
    data_criacao        DATETIME DEFAULT GETDATE(),
    data_atualizacao    DATETIME DEFAULT GETDATE(),
    recadastramento     BIT
)

CREATE TABLE dbo.secao
(
    id        INT PRIMARY KEY IDENTITY (1,1),
    descricao VARCHAR(255) UNIQUE
)

CREATE TABLE dbo.item
(
    id        INT PRIMARY KEY IDENTITY (1,1),
    descricao VARCHAR(255),
    id_secao  INT FOREIGN KEY REFERENCES secao(id),
    UNIQUE (id_secao, descricao)
)

CREATE TABLE dbo.auth_aplicativos
(
  id          INT PRIMARY KEY IDENTITY (1,1) NOT NULL,
  nome        VARCHAR(100) NOT NULL,
  token       VARCHAR(1000) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim    DATE NULL,
  ativo       BIT NOT NULL,
  PRIMARY KEY CLUSTERED
  (
    id ASC
  ) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON PRIMARY
) ON PRIMARY

--
-- TABELAS N-N
--

CREATE TABLE dbo.usuario_grupo
(
    id_grupo    INT NOT NULL FOREIGN KEY REFERENCES grupo(id),
    id_usuario  INT NOT NULL FOREIGN KEY REFERENCES usuario(id),
    PRIMARY KEY ( id_grupo, id_usuario )
)

CREATE TABLE dbo.perfil_item
(
    id_perfil   INT NOT NULL FOREIGN KEY REFERENCES perfil(id),
    id_item     INT NOT NULL FOREIGN KEY REFERENCES item(id),
    PRIMARY KEY ( id_perfil, id_item )
)

CREATE TABLE dbo.usuario_item
(
    id_usuario  INT NOT NULL FOREIGN KEY REFERENCES usuario(id),
    id_item     INT NOT NULL FOREIGN KEY REFERENCES item(id),
    PRIMARY KEY ( id_usuario, id_item )
)


--
-- Triggers para atualizar campos de data_atualizacao
--
GO
CREATE TRIGGER TRG_usuario_update ON dbo.usuario FOR UPDATE AS
BEGIN
    UPDATE dbo.usuario
    SET data_atualizacao = GETDATE()
    FROM dbo.usuario INNER JOIN DELETED D ON dbo.usuario.id = D.id
END

GO
CREATE TRIGGER TRG_pessoa_update ON dbo.pessoa FOR UPDATE AS
BEGIN
    UPDATE dbo.pessoa
    SET data_atualizacao = GETDATE()
    FROM dbo.pessoa INNER JOIN DELETED D ON dbo.pessoa.id = D.id
END
