import { Model } from '../core/Model.js';
import { Validador } from '../utils/Validador.js';

/** grupos/{grupoId}/despesas/{despesaId}/divisoes. Parte da despesa atribuída a um terceiro (UC08). */
export class DivisaoDespesa extends Model {
  constructor(dados = {}) {
    super(dados);
    this.valor = dados.valor ?? null;
    this.terceiroId = dados.terceiroId ?? null;
  }

  validar() {
    return new Validador()
      .exigir('terceiroId', this.terceiroId, 'o terceiro')
      .valorPositivo('valor', this.valor)
      .erros;
  }
}
