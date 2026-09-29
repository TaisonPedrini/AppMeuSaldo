import { Model } from '../core/Model.js';
import { Validador } from '../utils/Validador.js';
import { dataISOValida } from '../utils/data.js';

/** grupos/{grupoId}/terceiros/{terceiroId}/reembolsos. Pagamento de volta de um terceiro (UC11). */
export class Reembolso extends Model {
  constructor(dados = {}) {
    super(dados);
    this.valor = dados.valor ?? null;
    this.data = dados.data ?? '';
    this.terceiroId = dados.terceiroId ?? null;
    this.despesaId = dados.despesaId ?? null;
  }

  validar() {
    return new Validador()
      .valorPositivo('valor', this.valor)
      .exigir('data', this.data, 'a data')
      .regra(dataISOValida(this.data), 'data', 'Informe uma data válida.')
      .exigir('terceiroId', this.terceiroId, 'o terceiro')
      .erros;
  }
}
