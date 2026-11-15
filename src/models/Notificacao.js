import { Model } from '../core/Model.js';

/**
 * grupos/{grupoId}/notificacoes. Fica no grupo (e não no usuário) para que qualquer
 * integrante possa gerar o alerta do outro; `usuarioId` indica o destinatário.
 * `data` é gravada pelo servidor (Timestamp do Firestore).
 */
export class Notificacao extends Model {
  constructor(dados = {}) {
    super(dados);
    this.data = dados.data ?? '';
    this.mensagem = dados.mensagem ?? '';
    this.lida = dados.lida ?? false;
    this.usuarioId = dados.usuarioId ?? null;
    this.orcamentoId = dados.orcamentoId ?? null;
  }

  /** Data em milissegundos (Timestamp do Firestore ou texto ISO), para ordenar e exibir. */
  get dataEmMs() {
    if (!this.data) return null;
    if (typeof this.data.toMillis === 'function') return this.data.toMillis();
    const ms = Date.parse(this.data);
    return Number.isNaN(ms) ? null : ms;
  }
}
