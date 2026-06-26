package pessoa

import (
	"context"
	"database/sql"

	"pandora-go-server/internal/types"
	"pandora-go-server/internal/utils"
)

// queryPessoas executa SELECTs de pessoa simplificada e retorna o DTO interno comum.
// Chamado por consultas especificas de CPF, nome, telefone, email e endereco.
func (m pessoaStore) queryPessoas(ctx context.Context, query string, cpf string, fonte string) ([]types.PessoaSimplificada, error) {
	rows, err := m.db.QueryContext(ctx, query, sql.Named("CPF", cpf))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]types.PessoaSimplificada, 0)
	for rows.Next() {
		var (
			cpf            sql.NullString
			nome           sql.NullString
			nomeMae        sql.NullString
			municipio      sql.NullString
			uf             sql.NullString
			dataNascimento sql.NullTime
			sexo           sql.NullString
			situacao       sql.NullString
			natureza       sql.NullString
			ocupacao       sql.NullString
			anoObito       sql.NullString
			anoExercicio   sql.NullString
		)
		if err := rows.Scan(
			&cpf,
			&nome,
			&nomeMae,
			&municipio,
			&uf,
			&dataNascimento,
			&sexo,
			&situacao,
			&natureza,
			&ocupacao,
			&anoObito,
			&anoExercicio,
		); err != nil {
			return nil, err
		}
		result = append(result, types.PessoaSimplificada{
			CPF:                  utils.SQLStringPtr(cpf),
			Nome:                 utils.SQLStringPtr(nome),
			NomeMae:              utils.SQLStringPtr(nomeMae),
			Municipio:            utils.SQLStringPtr(municipio),
			UF:                   utils.SQLStringPtr(uf),
			DataNascimento:       utils.SQLDatePtr(dataNascimento),
			Sexo:                 utils.SQLStringPtr(sexo),
			SituacaoCadastral:    utils.SQLStringPtr(situacao),
			NaturezaOcupacao:     utils.SQLStringPtr(natureza),
			OcupacaoPrincipal:    utils.SQLStringPtr(ocupacao),
			AnoObito:             utils.SQLStringPtr(anoObito),
			AnoExercicioOcupacao: utils.SQLStringPtr(anoExercicio),
			Fonte:                fonte,
		})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return result, nil
}
