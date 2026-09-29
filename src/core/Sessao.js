// Estado da sessão: usuário autenticado e seu grupo financeiro.
let usuarioAtual = null;

export const Sessao = {
  /** @returns {import('../models/Usuario.js').Usuario|null} */
  get usuario() {
    return usuarioAtual;
  },

  get grupoId() {
    return usuarioAtual?.grupoId ?? null;
  },

  definir(usuario) {
    usuarioAtual = usuario;
  },

  definirGrupo(grupoId) {
    if (usuarioAtual) usuarioAtual.grupoId = grupoId;
  },
};
