import { Model } from '../core/Model.js';
import { Validador } from '../utils/Validador.js';
import { TipoCategoria } from './enums.js';

/** grupos/{grupoId}/categorias */
export class Categoria extends Model {
  constructor(dados = {}) {
    super(dados);
    this.nome = dados.nome ?? '';
    this.tipo = dados.tipo ?? TipoCategoria.DESPESA;
  }

  validar() {
    return new Validador()
      .exigir('nome', this.nome, 'o nome da categoria')
      .regra(Object.values(TipoCategoria).includes(this.tipo), 'tipo', 'Escolha se a categoria é de receita ou de despesa.')
      .erros;
  }
}
