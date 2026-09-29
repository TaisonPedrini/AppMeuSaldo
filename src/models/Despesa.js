import { Model } from '../core/Model.js';
import { Validador } from '../utils/Validador.js';
import { dataISOValida } from '../utils/data.js';
import { Classificacao, FormaPagamento, Periodicidade } from './enums.js';

/** grupos/{grupoId}/despesas. valor em centavos, datas em ISO. Divisões ficam na subcoleção `divisoes`. */
export class Despesa extends Model {
  constructor(dados = {}) {
    super(dados);
    this.descricao = dados.descricao ?? '';
    this.data = dados.data ?? '';
    this.valor = dados.valor ?? null;
    this.formaPagamento = dados.formaPagamento ?? null;
    this.classificacao = dados.classificacao ?? Classificacao.PESSOAL;
    this.cupomFiscalUrl = dados.cupomFiscalUrl ?? null;
    this.recorrente = dados.recorrente ?? false;
    this.periodicidade = dados.periodicidade ?? null;
    this.dataFim = dados.dataFim ?? null;
    this.abateIR = dados.abateIR ?? false;
    this.categoriaId = dados.categoriaId ?? null;
    this.usuarioId = dados.usuarioId ?? null;
    this.cartaoId = dados.cartaoId ?? null;
  }

  validar() {
    const v = new Validador()
      .valorPositivo('valor', this.valor)
      .exigir('data', this.data, 'a data')
      .regra(dataISOValida(this.data), 'data', 'Informe uma data válida.')
      .exigir('descricao', this.descricao, 'a descrição')
      .exigir('categoriaId', this.categoriaId, 'a categoria')
      .exigir('formaPagamento', this.formaPagamento, 'a forma de pagamento')
      .regra(Object.values(Classificacao).includes(this.classificacao), 'classificacao', 'Escolha a classificação da despesa.')
      .exigir('usuarioId', this.usuarioId, 'quem realizou a despesa');

    if (this.formaPagamento === FormaPagamento.CREDITO) {
      v.exigir('cartaoId', this.cartaoId, 'o cartão');
    }

    if (this.recorrente) {
      v.regra(Object.values(Periodicidade).includes(this.periodicidade), 'periodicidade', 'Escolha a periodicidade.');
      v.regra(
        !this.dataFim || (dataISOValida(this.dataFim) && this.dataFim >= this.data),
        'dataFim',
        'A data final deve ser igual ou posterior à data da despesa.',
      );
    }

    return v.erros;
  }
}
