import { Model } from '../core/Model.js';
import { Validador } from '../utils/Validador.js';
import { dataISOValida } from '../utils/data.js';

/** grupos/{grupoId}/receitas. valor em centavos, data em ISO. */
export class Receita extends Model {
  constructor(dados = {}) {
    super(dados);
    this.descricao = dados.descricao ?? '';
    this.data = dados.data ?? '';
    this.valor = dados.valor ?? null;
    this.categoriaId = dados.categoriaId ?? null;
    this.usuarioId = dados.usuarioId ?? null;
  }

  validar() {
    return new Validador()
      .exigir('descricao', this.descricao, 'a descrição')
      .exigir('data', this.data, 'a data')
      .regra(dataISOValida(this.data), 'data', 'Informe uma data válida.')
      .valorPositivo('valor', this.valor)
      .exigir('categoriaId', this.categoriaId, 'a categoria')
      .exigir('usuarioId', this.usuarioId, 'quem recebeu')
      .erros;
  }
}
