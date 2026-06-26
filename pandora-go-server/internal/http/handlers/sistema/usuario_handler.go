package sistema

import (
	"encoding/json"
	"net/http"
	"pandora-go-server/internal/http/handlers/shared"
	"strings"

	"pandora-go-server/internal/httpx"
	"pandora-go-server/internal/types"
)

func (h Handler) listaUsuarios(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.ListUsers(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) listaUsuariosParcial(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.ListUsersPartial(r.Context(), r.PathValue("busca"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) getUsuario(w http.ResponseWriter, r *http.Request) {
	id, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	result, err := h.auth.User(r.Context(), id)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: []types.Usuario{result}})
}

func (h Handler) usuariosGetSubroute(w http.ResponseWriter, r *http.Request) {
	path := strings.Trim(r.URL.Path, "/")
	if strings.HasPrefix(path, "usuarios/parcial/") {
		busca := strings.TrimPrefix(path, "usuarios/parcial/")
		result, err := h.auth.ListUsersPartial(r.Context(), busca)
		if err != nil {
			httpx.ErrorFrom(w, err)
			return
		}
		httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
		return
	}
	if strings.HasPrefix(path, "usuarios/") && strings.HasSuffix(path, "/permissao") {
		idPart := strings.TrimSuffix(strings.TrimPrefix(path, "usuarios/"), "/permissao")
		id, err := shared.ParseID(idPart)
		if err != nil {
			httpx.ErrorFrom(w, err)
			return
		}
		result, err := h.auth.UserPermissionsRaw(r.Context(), id)
		if err != nil {
			httpx.ErrorFrom(w, err)
			return
		}
		httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
		return
	}
	if strings.HasPrefix(path, "usuarios/") && !strings.Contains(strings.TrimPrefix(path, "usuarios/"), "/") {
		id, err := shared.ParseID(strings.TrimPrefix(path, "usuarios/"))
		if err != nil {
			httpx.ErrorFrom(w, err)
			return
		}
		result, err := h.auth.User(r.Context(), id)
		if err != nil {
			httpx.ErrorFrom(w, err)
			return
		}
		httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: []types.Usuario{result}})
		return
	}
	httpx.ErrorFrom(w, types.ErrNotFound)
}

func (h Handler) listaUsuariosFalsos(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.ListDeletedUsers(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) cadastraPreUsuario(w http.ResponseWriter, r *http.Request) {
	var payload types.PessoaUsuarioCadastro
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	if err := h.auth.RegisterPreUser(r.Context(), payload, shared.ClientIP(r)); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "CADASTRO REALIZADO COM SUCESSO."})
}

func (h Handler) recadastraPreUsuario(w http.ResponseWriter, r *http.Request) {
	id, err := shared.CurrentUserID(r)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	var payload types.PessoaUsuarioCadastro
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	if err := h.auth.RecadastrarPreUser(r.Context(), payload, id, shared.ClientIP(r)); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "RECADASTRAMENTO REALIZADO COM SUCESSO."})
}

func (h Handler) listaPerfis(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.ListProfiles(r.Context())
	h.writeList(w, result, err)
}

func (h Handler) listaPerfisCompletos(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.ListFullProfiles(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) listaAcessos(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.ListAccesses(r.Context())
	h.writeList(w, result, err)
}

func (h Handler) listaGrupos(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.ListGroups(r.Context())
	h.writeList(w, result, err)
}

func (h Handler) listaPermissoesSistema(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.ListPermissionCatalog(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) permissoesUsuario(w http.ResponseWriter, r *http.Request) {
	id, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	result, err := h.auth.UserPermissionsRaw(r.Context(), id)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) permissoesPerfil(w http.ResponseWriter, r *http.Request) {
	id, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	result, err := h.auth.ProfilePermissions(r.Context(), id)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) horarioPerfil(w http.ResponseWriter, r *http.Request) {
	id, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	result, err := h.auth.ProfileSchedule(r.Context(), id)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) usuariosPorPerfil(w http.ResponseWriter, r *http.Request) {
	id, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	result, err := h.auth.UsersByProfile(r.Context(), id)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) listaPreUsuariosInativos(w http.ResponseWriter, r *http.Request) {
	result, err := h.auth.ListInactivePreUsers(r.Context())
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) getPreUsuario(w http.ResponseWriter, r *http.Request) {
	id, err := shared.PathInt64(r, "id")
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	result, err := h.auth.PreUser(r.Context(), id)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}

func (h Handler) removePreUsuario(w http.ResponseWriter, r *http.Request) {
	id, err := shared.ParseID(strings.TrimPrefix(r.URL.Path, "/preusuarios/"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	if err := h.auth.DeletePreUser(r.Context(), id); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "USUARIO REMOVIDO COM SUCESSO."})
}

func (h Handler) habilitaRecadastramentoPreUsuario(w http.ResponseWriter, r *http.Request) {
	idPart := strings.TrimSuffix(strings.TrimPrefix(r.URL.Path, "/preusuarios/"), "/recadastra")
	id, err := shared.ParseID(idPart)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	if err := h.auth.EnablePreUserRecadastramento(r.Context(), id); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "USUARIO HABILITADO PARA RECADASTRAMENTO."})
}

func (h Handler) ativaPreUsuario(w http.ResponseWriter, r *http.Request) {
	id, err := shared.ParseID(strings.TrimPrefix(r.URL.Path, "/preusuarios/ativar/"))
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	actorID, err := shared.CurrentUserID(r)
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	var payload types.PessoaUsuarioCadastro
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		httpx.ErrorFrom(w, types.ErrInvalidPayload.WithCause(err))
		return
	}
	payload.ID = id
	if err := h.auth.ActivatePreUser(r.Context(), payload, actorID); err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Msg: "USUARIO ATIVADO COM SUCESSO."})
}

func (h Handler) preUsuariosPostSubroute(w http.ResponseWriter, r *http.Request) {
	path := strings.Trim(r.URL.Path, "/")
	if strings.HasPrefix(path, "preusuarios/ativar/") {
		h.ativaPreUsuario(w, r)
		return
	}
	if strings.HasPrefix(path, "preusuarios/") && strings.HasSuffix(path, "/recadastra") {
		h.habilitaRecadastramentoPreUsuario(w, r)
		return
	}
	httpx.ErrorFrom(w, types.ErrNotFound)
}

func (h Handler) preUsuariosDeleteSubroute(w http.ResponseWriter, r *http.Request) {
	path := strings.Trim(r.URL.Path, "/")
	if strings.HasPrefix(path, "preusuarios/") && !strings.Contains(strings.TrimPrefix(path, "preusuarios/"), "/") {
		h.removePreUsuario(w, r)
		return
	}
	httpx.ErrorFrom(w, types.ErrNotFound)
}

func (h Handler) writeList(w http.ResponseWriter, result []string, err error) {
	if err != nil {
		httpx.ErrorFrom(w, err)
		return
	}
	httpx.JSON(w, http.StatusOK, httpx.APIResponse{Status: "OK", Data: result})
}
