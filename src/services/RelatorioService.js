// Indicadores financeiros do mês (UC16 / RF016), usados na tela de relatórios e no PDF (UC18).
import { TipoCategoria } from '../models/enums.js';
import { CategoriaRepository } from '../repositories/CategoriaRepository.js';
import { TerceiroRepository } from '../repositories/TerceiroRepository.js';
import { LancamentoService, gastosPorPessoa, totalizar } from './LancamentoService.js';
import { OrcamentoService } from './OrcamentoService.js';

export class RelatorioService {
  constructor(grupoId) {
    this.grupoId = grupoId;
  }

  /**
   * @param {string} periodo "AAAA-MM"
   * @param {{ id: string, nome: string }} usuario quem está consultando (para "gastos por pessoa")
   */
  async indicadores(periodo, usuario) {
    const [lancamentos, categorias, terceiros, orcamento] = await Promise.all([
      new LancamentoService(this.grupoId).doPeriodo(periodo),
      new CategoriaRepository(this.grupoId).listarTodos(),
      new TerceiroRepository(this.grupoId).listarTodos(),
      new OrcamentoService(this.grupoId).resumoDoPeriodo(periodo),
    ]);

    const nomes = new Map(categorias.map((c) => [c.id, c.nome]));
    const porCategoria = new Map();
    for (const l of lancamentos) {
      if (l.tipo !== TipoCategoria.DESPESA) continue;
      porCategoria.set(l.categoriaId, (porCategoria.get(l.categoriaId) ?? 0) + l.valor);
    }
    const despesasPorCategoria = [...porCategoria]
      .map(([id, valor]) => ({ nome: nomes.get(id) ?? 'Sem categoria', valor }))
      .sort((a, b) => b.valor - a.valor);

    const totais = totalizar(lancamentos);
    const pessoas = gastosPorPessoa(lancamentos, usuario.id);

    return {
      totais,
      maiorGasto: despesasPorCategoria[0] ?? null,
      despesasPorCategoria,
      porPessoa: [
        { nome: usuario.nome.split(' ')[0], valor: pessoas.usuario },
        { nome: 'Outro integrante', valor: pessoas.outro },
        { nome: 'Terceiros', valor: pessoas.terceiros },
      ],
      terceiros: terceiros.map((t) => ({ nome: t.nome, saldoDevedor: t.saldoDevedor })),
      orcamento: orcamento.itens.map((i) => ({ categoria: i.categoria, utilizado: i.utilizado, limite: i.orcamento.limite, fracao: i.fracao })),
      lancamentos: lancamentos.map((l) => ({ ...l, categoria: nomes.get(l.categoriaId) ?? 'Sem categoria' })),
    };
  }
}
