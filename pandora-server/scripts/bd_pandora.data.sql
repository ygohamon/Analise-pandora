USE BD_PANDORA

INSERT INTO dbo.grupo (descricao)
VALUES
('Membro - MPPB'), ('Membro - TJPB'), ('GAECO')

INSERT INTO dbo.perfil (descricao)
VALUES
('publico'), ('privado'), ('completo'), ('admin'), ('micro')

INSERT INTO dbo.secao (descricao)
VALUES
('pesquisa'), ('apps'), ('analise'), ('cadastro'), ('sistema')

INSERT INTO dbo.item (descricao, id_secao)
SELECT 'pessoa',             S.id FROM dbo.secao S WHERE S.descricao = 'pesquisa' UNION ALL
SELECT 'empresa',            S.id FROM dbo.secao S WHERE S.descricao = 'pesquisa' UNION ALL
SELECT 'endereco',           S.id FROM dbo.secao S WHERE S.descricao = 'pesquisa' UNION ALL
SELECT 'veiculo',            S.id FROM dbo.secao S WHERE S.descricao = 'pesquisa' UNION ALL
SELECT 'telefone',           S.id FROM dbo.secao S WHERE S.descricao = 'pesquisa' UNION ALL
SELECT 'preso',              S.id FROM dbo.secao S WHERE S.descricao = 'pesquisa' UNION ALL
SELECT 'obito',              S.id FROM dbo.secao S WHERE S.descricao = 'pesquisa' UNION ALL
SELECT 'folha de pagamento', S.id FROM dbo.secao S WHERE S.descricao = 'pesquisa' UNION ALL
SELECT 'imovel',             S.id FROM dbo.secao S WHERE S.descricao = 'pesquisa' UNION ALL
SELECT 'embarcacao',         S.id FROM dbo.secao S WHERE S.descricao = 'pesquisa' UNION ALL

SELECT 'yellowpages',         S.id FROM dbo.secao S WHERE S.descricao = 'apps' UNION ALL
SELECT 'painelcovid',         S.id FROM dbo.secao S WHERE S.descricao = 'apps' UNION ALL
SELECT 'integra',             S.id FROM dbo.secao S WHERE S.descricao = 'apps' UNION ALL
SELECT 'caca fantasmas',      S.id FROM dbo.secao S WHERE S.descricao = 'apps' UNION ALL
SELECT 'dna',                 S.id FROM dbo.secao S WHERE S.descricao = 'apps' UNION ALL
SELECT 'inp',                 S.id FROM dbo.secao S WHERE S.descricao = 'apps' UNION ALL
SELECT 'mapa de consumo',     S.id FROM dbo.secao S WHERE S.descricao = 'apps' UNION ALL
SELECT 'relacionamentos',     S.id FROM dbo.secao S WHERE S.descricao = 'apps' UNION ALL
SELECT 'relatorio integrado', S.id FROM dbo.secao S WHERE S.descricao = 'apps' UNION ALL
SELECT 'erb tracker',         S.id FROM dbo.secao S WHERE S.descricao = 'apps' UNION ALL
SELECT 'tiporank',            S.id FROM dbo.secao S WHERE S.descricao = 'apps' UNION ALL
SELECT 'ariel',               S.id FROM dbo.secao S WHERE S.descricao = 'apps' UNION ALL
SELECT 'simba',               S.id FROM dbo.secao S WHERE S.descricao = 'apps' UNION ALL

SELECT 'empenhos',      S.id FROM dbo.secao S WHERE S.descricao = 'analise' UNION ALL
SELECT 'licitacoes',    S.id FROM dbo.secao S WHERE S.descricao = 'analise' UNION ALL
SELECT 'aditivos',      S.id FROM dbo.secao S WHERE S.descricao = 'analise' UNION ALL
SELECT 'contratos',     S.id FROM dbo.secao S WHERE S.descricao = 'analise' UNION ALL

SELECT 'endereco',  S.id FROM dbo.secao S WHERE S.descricao = 'cadastro' UNION ALL
SELECT 'telefone',  S.id FROM dbo.secao S WHERE S.descricao = 'cadastro' UNION ALL

SELECT 'sistema',  S.id FROM dbo.secao S WHERE S.descricao = 'sistema'

--
-- Adiciona as permissões dos perfis 'publico', 'privado' e 'admin'
--

--
-- PERFIL PUBLICO
--

;WITH permissao_perfil_publico(id)
AS
(
    SELECT I.id
	FROM dbo.item I
		INNER JOIN dbo.secao S ON (I.id_secao = S.id)
	WHERE S.descricao = 'pesquisa' AND I.descricao = 'pessoa'
)

INSERT INTO dbo.perfil_item (id_perfil, id_item)
SELECT P.id, PP.id
FROM dbo.perfil P
    CROSS JOIN permissao_perfil_publico PP
WHERE P.descricao = 'publico'
    AND NOT EXISTS (SELECT PI.id_perfil, PI.id_item FROM dbo.perfil_item PI WHERE PI.id_perfil = P.id AND PI.id_item = PP.id)

--
-- PERFIL PRIVADO
--

;WITH permissao_perfil_privado(id)
AS
(
    SELECT I.id
	FROM dbo.item I
		INNER JOIN dbo.secao S ON (I.id_secao = S.id)
	WHERE (S.DESCRICAO = 'pesquisa' AND
        (
            I.descricao = 'PESSOA' OR
            I.descricao = 'EMPRESA' OR
            I.descricao = 'ENDERECO' OR
            I.descricao = 'VEICULO' OR
            I.descricao = 'TELEFONE' OR
            I.descricao = 'PRESO' OR
            I.descricao = 'OBITO' OR
            I.descricao = 'FOLHA DE PAGAMENTO'
        )
    ) OR
        (S.DESCRICAO = 'APPS' AND
            (
                I.DESCRICAO = 'RELACIONAMENTOS' OR
                I.DESCRICAO = 'RELATORIO INTEGRADO' OR
                I.DESCRICAO = 'ERB TRACKER' OR
                I.DESCRICAO = 'TIPORANK' OR
                I.DESCRICAO = 'YELLOWPAGES'
            )
        )
)

INSERT INTO dbo.perfil_item (id_perfil, id_item)
SELECT P.id, PP.id
FROM dbo.perfil P
    CROSS JOIN permissao_perfil_privado PP
WHERE P.descricao = 'privado'
    AND NOT EXISTS (SELECT PI.id_perfil, PI.id_item FROM dbo.perfil_item PI WHERE PI.id_perfil = P.id AND PI.id_item = PP.id)

--
-- PERFIL COMPLETO
--

;WITH permissao_perfil_completo(id)
AS
(
    SELECT I.id
	FROM dbo.item I
		INNER JOIN dbo.secao S ON (I.id_secao = S.id)
	WHERE S.DESCRICAO IN ('pesquisa', 'apps', 'analise', 'cadastro')
)

INSERT INTO dbo.perfil_item (id_perfil, id_item)
SELECT P.id, PC.id
FROM dbo.perfil P
    CROSS JOIN permissao_perfil_completo PC
WHERE P.descricao = 'completo'
    AND NOT EXISTS (SELECT PI.id_perfil, PI.id_item FROM dbo.perfil_item PI WHERE PI.id_perfil = P.id AND PI.id_item = PC.id)


--
-- PERFIL ADMIN
--

;WITH permissao_perfil_admin(id)
AS
(
    SELECT I.id
	FROM dbo.item I
		INNER JOIN dbo.secao S ON (I.id_secao = S.id)
)

INSERT INTO dbo.perfil_item (id_perfil, id_item)
SELECT P.id, PP.id
FROM dbo.perfil P
    CROSS JOIN permissao_perfil_admin PP
WHERE P.descricao = 'admin'
    AND NOT EXISTS (SELECT PI.id_perfil, PI.id_item FROM dbo.perfil_item PI WHERE PI.id_perfil = P.id AND PI.id_item = PP.id)


--
-- PERFIL MICRO
--
