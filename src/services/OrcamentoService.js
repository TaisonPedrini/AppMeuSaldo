// Orçamento por categoria (UC12 / RF012, RF013).
// O consumo exibido é recalculado a partir das despesas do mês, para refletir também despesas
// lançadas antes de o limite existir; o valorUtilizado gravado serve aos alertas do DespesaService.
import { Orcamento } from '../models/Orcamento.js';
import { TipoCategoria } from '../models/enums.js';
import { CategoriaRepository } from '../repositories/CategoriaRepository.js';
import { DespesaRepository } from '../repositories/DespesaRepository.js';
import { OrcamentoRepository } from '../repositories/OrcamentoRepository.js';

/** Situação do consumo: dentro do limite, atenção (≥ 80%, RF018) ou excedido (≥ 100%). */
export function situacaoDoConsumo(fracao) {
  if (fracao >= 1) return 'EXCEDIDO';
  if (fracao >= 0.8) return 'ATENCAO';
  return 'OK';
}

export class OrcamentoService {
  constructor(grupoId) {
    this.grupoId = grupoId;
    this.orcamentos = new OrcamentoRepository(grupoId);
  }

  /**
   * Limites do mês com o consumo de cada categoria.
   * @returns {Promise<{ categorias: object[], itens: { orcamento: Orcamento, categoria: string, utilizado: number,
   *   fracao: number, situacao: string }[], totais: { limite: number, utilizado: number } }>}
   */
  async resumoDoPeriodo(periodo) {
    const [categorias, orcamentos, despesas] = await Promise.all([
      new CategoriaRepository(this.grupoId).listarPorTipo(TipoCategoria.DESPESA),
      this.orcamentos.listarDoPeriodo(periodo),
      new DespesaRepository(this.grupoId).listarDoPeriodo(periodo),
    ]);

    const gastoPorCategoria = new Map();
    for (const d of despesas) gastoPorCategoria.set(d.categoriaId, (gastoPorCategoria.get(d.categoriaId) ?? 0) + d.valor);
    const nomes = new Map(categorias.map((c) => [c.id, c.nome]));

    const itens = orcamentos
      .map((orcamento) => {
        const utilizado = gastoPorCategoria.get(orcamento.categoriaId) ?? 0;
        const fracao = orcamento.limite ? utilizado / orcamento.limite : 0;
        return { orcamento, categoria: nomes.get(orcamento.categoriaId) ?? 'Categoria removida', utilizado, fracao, situacao: situacaoDoConsumo(fracao) };
      })
      .sort((a, b) => b.fracao - a.fracao);

    const totais = itens.reduce((t, i) => ({ limite: t.limite + i.orcamento.limite, utilizado: t.utilizado + i.utilizado }), { limite: 0, utilizado: 0 });
    return { categorias, itens, totais };
  }

  /** Define ou altera o limite da categoria no mês, já com o consumo atual (UC12). */
  async definir({ categoriaId, periodo, limite }) {
    const despesas = await new DespesaRepository(this.grupoId).listarDoPeriodo(periodo);
    const valorUtilizado = despesas.filter((d) => d.categoriaId === categoriaId).reduce((soma, d) => soma + d.valor, 0);
    return this.orcamentos.definir(new Orcamento({ categoriaId, periodo, limite, valorUtilizado }));
  }

  remover(orcamentoId) {
    return this.orcamentos.excluir(orcamentoId);
  }
}
