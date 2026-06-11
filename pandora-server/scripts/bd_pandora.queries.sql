USE BD_DEV

-- 
-- LISTA AS PERMISSOES DO USUARIO
-- 

DECLARE @LOGIN VARCHAR = NULL
DECLARE @ID INT = 1

SELECT S.id as id_secao, S.descricao as secao, I.id as id_item, I.descricao as item
FROM BD_DEV.dbo.perfil P
    INNER JOIN BD_DEV.dbo.perfil_item PI ON (P.id = PI.id_perfil)
    INNER JOIN BD_DEV.dbo.item I ON (PI.id_item = I.id)
    INNER JOIN BD_DEV.dbo.secao S ON (I.id_secao = S.id)
OUTER APPLY(
    SELECT P.descricao
    FROM BD_DEV.dbo.usuario U
        INNER JOIN BD_DEV.dbo.perfil P ON (U.id_perfil = P.id)
    WHERE U.login = @LOGIN OR U.ID = @ID
) U
WHERE P.descricao = U.descricao

UNION ALL

SELECT S.id as id_secao, S.descricao as secao, I.id as id_item, I.descricao as item
FROM BD_DEV.dbo.usuario U
    INNER JOIN BD_DEV.dbo.usuario_item UI ON (U.id = UI.id_usuario)
    INNER JOIN BD_DEV.dbo.item I ON (UI.id_item = I.id)
    INNER JOIN BD_DEV.dbo.secao S ON (I.id_secao = S.id)
WHERE U.login = @LOGIN OR U.ID = @ID