import { Model } from '../core/Model.js';

/**
 * grupos/{grupoId}/notificacoes. Fica no grupo (e não no usuário) para que qualquer
 * integrante possa gerar o alerta do outro; `usuarioId` indica o destinatário.
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
}
