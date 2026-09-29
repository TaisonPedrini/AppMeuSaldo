import { RepositorioDoGrupo } from '../core/RepositorioDoGrupo.js';
import { where } from '../lib/firebase.js';
import { Notificacao } from '../models/Notificacao.js';

export class NotificacaoRepository extends RepositorioDoGrupo {
  constructor(grupoId) {
    super(grupoId, 'notificacoes', Notificacao);
  }

  /** Alertas do usuário, mais recentes primeiro (UC13). Requer índice composto usuarioId + data. */
  listarDoUsuario(usuarioId, cursor = null) {
    return this.listar({ restricoes: [where('usuarioId', '==', usuarioId)], ordenarPor: 'data', cursor });
  }
}
