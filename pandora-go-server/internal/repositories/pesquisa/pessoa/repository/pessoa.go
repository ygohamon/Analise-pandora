package pessoa

import (
	"database/sql"

	"pandora-go-server/internal/modelconfig"
)

type pessoaStore struct {
	db     *sql.DB
	models modelconfig.Registry
}

// pessoaSimplificadoModel agrupa consultas especificas usadas pelas rotas /pessoas/simplificado.
type pessoaSimplificadoModel struct {
	pessoaStore
}

// pessoaIntegradoLocalModel agrupa helpers de fontes locais chamadas por ports/usecases.
type pessoaIntegradoLocalModel struct {
	pessoaStore
}

// pessoaIntegradoExternoModel agrupa helpers de fontes externas chamadas por ports/usecases.
type pessoaIntegradoExternoModel struct {
	pessoaStore
}

// SQLRepository consulta pessoas e dados relacionados nas bases configuradas.
type SQLRepository struct {
	pessoaStore
}

// NewSQLRepository cria o repository SQL usado pelos casos de uso de Pessoa.
func NewSQLRepository(db *sql.DB, models modelconfig.Registry) SQLRepository {
	return SQLRepository{pessoaStore: pessoaStore{db: db, models: models}}
}

func (m SQLRepository) simplificadoModel() pessoaSimplificadoModel {
	return pessoaSimplificadoModel{pessoaStore: m.pessoaStore}
}

func (m SQLRepository) integradoLocalModel() pessoaIntegradoLocalModel {
	return pessoaIntegradoLocalModel{pessoaStore: m.pessoaStore}
}

func (m SQLRepository) integradoExternoModel() pessoaIntegradoExternoModel {
	return pessoaIntegradoExternoModel{pessoaStore: m.pessoaStore}
}
