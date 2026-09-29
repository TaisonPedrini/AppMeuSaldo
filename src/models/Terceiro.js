import { Model } from '../core/Model.js';
import { Validador } from '../utils/Validador.js';

/** grupos/{grupoId}/terceiros. saldoDevedor em centavos, atualizado pelos serviços de despesa e reembolso. */
export class Terceiro extends Model {
  constructor(dados = {}) {
    super(dados);
    this.nome = dados.nome ?? '';
    this.saldoDevedor = dados.saldoDevedor ?? 0;
  }

  validar() {
    return new Validador().exigir('nome', this.nome, 'o nome').erros;
  }
}
