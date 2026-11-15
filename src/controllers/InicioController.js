import { Controller } from '../core/Controller.js';
import { NotificacaoRepository } from '../repositories/NotificacaoRepository.js';
import { LancamentoService, gastosPorPessoa } from '../services/LancamentoService.js';
import { OrcamentoService } from '../services/OrcamentoService.js';
import { ProjecaoService } from '../services/ProjecaoService.js';
import { InicioView } from '../views/inicio/InicioView.js';
import { hojeISO, nomeDoMes, periodoDe } from '../utils/data.js';

const QUANTIDADE_ULTIMOS = 5;

/** Painel inicial: saldo projetado (UC15), alerta de orçamento (UC13), gastos por pessoa e últimos lançamentos. */
export class InicioController extends Controller {
  async index() {
    const periodo = periodoDe(hojeISO());
    const primeiroNome = this.usuario.nome.split(' ')[0];
    const view = new InicioView(this.conteudo).render({ nomeUsuario: primeiroNome, mes: nomeDoMes(periodo) });

    try {
      const [projecao, orcamento, lancamentos, alertas] = await Promise.all([
        new ProjecaoService(this.grupoId).calcular(periodo),
        new OrcamentoService(this.grupoId).resumoDoPeriodo(periodo),
        new LancamentoService(this.grupoId).doPeriodo(periodo),
        new NotificacaoRepository(this.grupoId).listarDoUsuario(this.usuario.id),
      ]);

      view.mostrarPainel({
        projecao,
        // Itens já vêm do mais consumido para o menos; o primeiro em atenção ou excedido é o destaque.
        alerta: orcamento.itens.find((i) => i.situacao !== 'OK') ?? null,
        temLimites: orcamento.itens.length > 0,
        gastosPorPessoa: this.gastosPorPessoa(lancamentos, primeiroNome),
        ultimos: lancamentos.slice(0, QUANTIDADE_ULTIMOS).map((l) => ({
          ...l, pessoa: l.usuarioId === this.usuario.id ? primeiroNome : 'Outro integrante',
        })),
        alertasNaoLidos: alertas.filter((n) => !n.lida).length,
      });
    } catch (erro) {
      this.tratarErro(erro);
    }
  }

  /** Despesas do mês por quem gastou (RF005); as de terceiro ficam numa linha própria (RF006). */
  gastosPorPessoa(lancamentos, primeiroNome) {
    const totais = gastosPorPessoa(lancamentos, this.usuario.id);
    return [
      { nome: primeiroNome, valor: totais.usuario, cor: 'pessoa-1' },
      { nome: 'Outro integrante', valor: totais.outro, cor: 'pessoa-2' },
      { nome: 'Terceiros', valor: totais.terceiros, cor: 'terceiros' },
    ];
  }
}
