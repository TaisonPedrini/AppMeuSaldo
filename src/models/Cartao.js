import { Model } from '../core/Model.js';
import { Validador } from '../utils/Validador.js';

/** grupos/{grupoId}/cartoes. limite em centavos. */
export class Cartao extends Model {
  constructor(dados = {}) {
    super(dados);
    this.nome = dados.nome ?? '';
    this.bandeira = dados.bandeira ?? '';
    this.limite = dados.limite ?? null;
  }

  validar() {
    return new Validador()
      .exigir('nome', this.nome, 'o nome do cartão')
      .exigir('bandeira', this.bandeira, 'o banco ou a bandeira')
      .valorPositivo('limite', this.limite)
      .erros;
  }
}
