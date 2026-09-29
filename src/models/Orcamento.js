import { Model } from '../core/Model.js';
import { Validador } from '../utils/Validador.js';

/**
 * grupos/{grupoId}/orcamentos/{AAAA-MM_categoriaId}. limite e valorUtilizado em centavos.
 * O id é derivado de período + categoria para haver um único orçamento por categoria no mês.
 */
export class Orcamento extends Model {
  constructor(dados = {}) {
    super(dados);
    this.periodo = dados.periodo ?? '';
    this.limite = dados.limite ?? null;
    this.valorUtilizado = dados.valorUtilizado ?? 0;
    this.categoriaId = dados.categoriaId ?? null;
    if (!this.id && this.periodo && this.categoriaId) this.id = Orcamento.idPara(this.categoriaId, this.periodo);
  }

  static idPara(categoriaId, periodo) {
    return `${periodo}_${categoriaId}`;
  }

  get percentualUtilizado() {
    return this.limite ? this.valorUtilizado / this.limite : 0;
  }

  validar() {
    return new Validador()
      .regra(/^\d{4}-\d{2}$/.test(this.periodo), 'periodo', 'Informe o mês do orçamento.')
      .valorPositivo('limite', this.limite)
      .exigir('categoriaId', this.categoriaId, 'a categoria')
      .erros;
  }
}
