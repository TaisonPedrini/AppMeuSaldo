import { RepositorioDoGrupo } from '../core/RepositorioDoGrupo.js';
import { protegido } from '../core/erros.js';
import { db, where, writeBatch } from '../lib/firebase.js';
import { Notificacao } from '../models/Notificacao.js';
import { registrarLogEm } from '../services/AuditoriaService.js';

export class NotificacaoRepository extends RepositorioDoGrupo {
  constructor(grupoId) {
    super(grupoId, 'notificacoes', Notificacao);
  }

  /**
   * Alertas do usuário, mais recentes primeiro (UC13).
   * Filtra só por usuarioId e ordena no navegador, para não depender de índice composto.
   */
  async listarDoUsuario(usuarioId) {
    const notificacoes = await this.listarTodos({ restricoes: [where('usuarioId', '==', usuarioId)], ordenarPor: 'mensagem' });
    return notificacoes.sort((a, b) => (b.dataEmMs ?? 0) - (a.dataEmMs ?? 0));
  }

  /** Marca vários alertas como lidos numa única gravação, com log de alteração (RNF002). */
  async marcarComoLidas(ids) {
    return protegido(async () => {
      const lote = writeBatch(db);
      for (const id of ids) {
        lote.update(this.ref(id), { lida: true });
        registrarLogEm(lote, this.grupoId, 'ALTERAR', 'Notificacao', id);
      }
      await lote.commit();
    }, 'Não foi possível atualizar os alertas. Verifique sua conexão e tente novamente.');
  }
}
