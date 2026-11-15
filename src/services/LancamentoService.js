// Histórico de movimentações (UC17 / RF022): junta receitas e despesas do mês,
// aplica os filtros e pagina em até 20 itens por página (RNF004).
// O mês inteiro é lido de uma vez porque os filtros combinados (pessoa, categoria, tipo,
// forma de pagamento e busca por texto) exigiriam um índice composto para cada combinação.
import { TAMANHO_PAGINA } from '../core/Repository.js';
import { Classificacao, TipoCategoria } from '../models/enums.js';
import { DespesaRepository } from '../repositories/DespesaRepository.js';
import { ReceitaRepository } from '../repositories/ReceitaRepository.js';

/**
 * @typedef {{ tipo: string, id: string, data: string, descricao: string, valor: number,
 *   categoriaId: string, usuarioId: string, formaPagamento: string|null, cartaoId: string|null,
 *   classificacao: string|null }} Lancamento
 */

export class LancamentoService {
  constructor(grupoId) {
    this.grupoId = grupoId;
  }

  /** @returns {Promise<Lancamento[]>} receitas e despesas do mês, mais recentes primeiro */
  async doPeriodo(periodo) {
    const [despesas, receitas] = await Promise.all([
      new DespesaRepository(this.grupoId).listarDoPeriodo(periodo),
      new ReceitaRepository(this.grupoId).listarDoPeriodo(periodo),
    ]);
    return [
      ...despesas.map((d) => ({
        tipo: TipoCategoria.DESPESA, id: d.id, data: d.data, descricao: d.descricao, valor: d.valor,
        categoriaId: d.categoriaId, usuarioId: d.usuarioId, formaPagamento: d.formaPagamento,
        cartaoId: d.cartaoId, classificacao: d.classificacao,
      })),
      ...receitas.map((r) => ({
        tipo: TipoCategoria.RECEITA, id: r.id, data: r.data, descricao: r.descricao, valor: r.valor,
        categoriaId: r.categoriaId, usuarioId: r.usuarioId, formaPagamento: null, cartaoId: null, classificacao: null,
      })),
    ].sort((a, b) => b.data.localeCompare(a.data) || a.descricao.localeCompare(b.descricao, 'pt-BR'));
  }
}

/**
 * Filtros de RF022. Campos vazios não filtram.
 * @param {Lancamento[]} lancamentos
 * @param {{ busca?: string, tipo?: string, categoriaId?: string, usuarioId?: string, formaPagamento?: string }} filtros
 */
export function filtrarLancamentos(lancamentos, filtros = {}) {
  const busca = normalizar(filtros.busca ?? '');
  return lancamentos.filter((l) =>
    (!busca || normalizar(l.descricao).includes(busca))
    && (!filtros.tipo || l.tipo === filtros.tipo)
    && (!filtros.categoriaId || l.categoriaId === filtros.categoriaId)
    && (!filtros.usuarioId || l.usuarioId === filtros.usuarioId)
    && (!filtros.formaPagamento || l.formaPagamento === filtros.formaPagamento));
}

/** Totais dos lançamentos já filtrados, em centavos. */
export function totalizar(lancamentos) {
  let receitas = 0;
  let despesas = 0;
  for (const l of lancamentos) {
    if (l.tipo === TipoCategoria.RECEITA) receitas += l.valor;
    else despesas += l.valor;
  }
  return { receitas, despesas, saldo: receitas - despesas };
}

/**
 * Despesas por quem gastou (RF005), com as de terceiro numa linha própria (RF006).
 * @returns {{ usuario: number, outro: number, terceiros: number }} centavos
 */
export function gastosPorPessoa(lancamentos, usuarioId) {
  const totais = { usuario: 0, outro: 0, terceiros: 0 };
  for (const l of lancamentos) {
    if (l.tipo !== TipoCategoria.DESPESA) continue;
    if (l.classificacao === Classificacao.TERCEIRO) totais.terceiros += l.valor;
    else if (l.usuarioId === usuarioId) totais.usuario += l.valor;
    else totais.outro += l.valor;
  }
  return totais;
}

/** Página `pagina` (começando em 1), com no máximo 20 itens (RNF004). */
export function paginar(lista, pagina, tamanho = TAMANHO_PAGINA) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / tamanho));
  const atual = Math.min(Math.max(1, pagina), totalPaginas);
  return { itens: lista.slice((atual - 1) * tamanho, atual * tamanho), pagina: atual, totalPaginas };
}

/** Busca sem diferenciar maiúsculas nem acentos ("salario" encontra "Salário"). */
function normalizar(texto) {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
