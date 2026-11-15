import { Model } from '../core/Model.js';
import { Validador } from '../utils/Validador.js';

/**
 * grupos/{grupoId}/cartoes. limite em centavos.
 * `bandeira` é o nome do banco ou da bandeira (dicionário de dados); `banco` é o id da lista de
 * models/bancos.js, usado só para mostrar o selo com a cor do banco (null em "outro").
 */
export class Cartao extends Model {
  constructor(dados = {}) {
    super(dados);
    this.nome = dados.nome ?? '';
    this.bandeira = dados.bandeira ?? '';
    this.banco = dados.banco ?? null;
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
