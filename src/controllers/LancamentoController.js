import { Controller } from '../core/Controller.js';
import { CategoriaRepository } from '../repositories/CategoriaRepository.js';
import { CartaoRepository } from '../repositories/CartaoRepository.js';
import { LancamentoService, filtrarLancamentos, paginar, totalizar } from '../services/LancamentoService.js';
import { LancamentosView } from '../views/lancamentos/LancamentosView.js';
import { hojeISO, periodoDe } from '../utils/data.js';

/** UC17 — Consultar histórico de movimentações, com filtros (RF022) e paginação (RNF004). */
export class LancamentoController extends Controller {
  async index() {
    this.view = new LancamentosView(this.conteudo);
    this.servico = new LancamentoService(this.grupoId);
    this.periodo = periodoDe(hojeISO());
    this.filtros = {};
    this.pagina = 1;

    try {
      const [categorias, cartoes] = await Promise.all([
        new CategoriaRepository(this.grupoId).listarTodos(),
        new CartaoRepository(this.grupoId).listarTodos(),
      ]);
      this.nomes = {
        categoria: new Map(categorias.map((c) => [c.id, c.nome])),
        cartao: new Map(cartoes.map((c) => [c.id, c.nome])),
      };
      this.view.render({ periodo: this.periodo, categorias, usuario: this.usuario });
    } catch (erro) {
      this.tratarErro(erro);
      return;
    }

    this.view.aoFiltrar((filtros) => this.filtrar(filtros));
    this.view.aoPaginar((pagina) => this.mostrarPagina(pagina));
    await this.carregarPeriodo();
  }

  async carregarPeriodo() {
    this.view.carregando(true);
    try {
      this.lancamentos = await this.servico.doPeriodo(this.periodo);
      this.mostrarPagina(1);
    } catch (erro) {
      this.lancamentos = [];
      this.mostrarPagina(1);
      this.tratarErro(erro);
    } finally {
      this.view.carregando(false);
    }
  }

  async filtrar({ periodo, ...filtros }) {
    this.filtros = filtros;
    if (periodo && periodo !== this.periodo) {
      this.periodo = periodo;
      await this.carregarPeriodo();
    } else {
      this.mostrarPagina(1);
    }
  }

  mostrarPagina(pagina) {
    const filtrados = filtrarLancamentos(this.lancamentos ?? [], this.filtros);
    const resultado = paginar(filtrados, pagina);
    this.view.mostrarLancamentos({
      ...resultado,
      itens: resultado.itens.map((l) => this.descrever(l)),
      totais: totalizar(filtrados),
      quantidade: filtrados.length,
    });
  }

  /** Acrescenta os nomes que a View exibe (categoria, cartão e quem lançou). */
  descrever(lancamento) {
    return {
      ...lancamento,
      categoria: this.nomes.categoria.get(lancamento.categoriaId) ?? 'Sem categoria',
      cartao: this.nomes.cartao.get(lancamento.cartaoId) ?? null,
      pessoa: lancamento.usuarioId === this.usuario.id ? this.usuario.nome.split(' ')[0] : 'Outro integrante',
    };
  }
}
