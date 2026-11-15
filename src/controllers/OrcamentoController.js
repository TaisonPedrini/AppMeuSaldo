import { Controller } from '../core/Controller.js';
import { OrcamentoService } from '../services/OrcamentoService.js';
import { NotificacaoRepository } from '../repositories/NotificacaoRepository.js';
import { OrcamentoView } from '../views/orcamento/OrcamentoView.js';
import { AlertasView } from '../views/orcamento/AlertasView.js';
import { Toast } from '../views/components/Toast.js';
import { paraCentavos } from '../utils/moeda.js';
import { hojeISO, nomeDoMes, periodoDe } from '../utils/data.js';

/** UC12 — Gerenciar orçamento (RF012, RF013); UC13 — Visualizar alertas de orçamento (RF018). */
export class OrcamentoController extends Controller {
  async index() {
    this.servico = new OrcamentoService(this.grupoId);
    this.periodo = periodoDe(hojeISO());
    this.view = new OrcamentoView(this.conteudo).render({ periodo: this.periodo });
    this.view.aoMudarPeriodo((periodo) => this.mudarPeriodo(periodo));
    this.view.aoDefinir((dados) => this.definir(dados));
    this.view.aoRemover((id, categoria) => this.remover(id, categoria));
    await this.carregar();
  }

  async carregar() {
    try {
      const resumo = await this.servico.resumoDoPeriodo(this.periodo);
      this.view.mostrarResumo({ ...resumo, mes: nomeDoMes(this.periodo) });
    } catch (erro) {
      this.tratarErro(erro);
    }
  }

  async mudarPeriodo(periodo) {
    if (!periodo || periodo === this.periodo) return;
    this.periodo = periodo;
    await this.carregar();
  }

  async definir(dados) {
    this.view.limparErros();
    this.view.ocupado(true);
    try {
      await this.servico.definir({ categoriaId: dados.categoriaId || null, periodo: this.periodo, limite: paraCentavos(dados.limite) });
      Toast.sucesso('Limite salvo.');
      this.view.limparFormulario();
      await this.carregar();
    } catch (erro) {
      this.tratarErro(erro, this.view);
    } finally {
      this.view.ocupado(false);
    }
  }

  async remover(id, categoria) {
    if (!this.view.confirmar(`Remover o limite de ${categoria} em ${nomeDoMes(this.periodo)}?`)) return;
    try {
      await this.servico.remover(id);
      Toast.sucesso('Limite removido.');
      await this.carregar();
    } catch (erro) {
      this.tratarErro(erro);
    }
  }

  /** UC13: alertas do usuário logado, gerados ao cadastrar despesas. */
  async alertas() {
    this.notificacoes = new NotificacaoRepository(this.grupoId);
    this.view = new AlertasView(this.conteudo).render();
    this.view.aoFiltrar((somenteNaoLidos) => this.mostrarAlertas(somenteNaoLidos));
    this.view.aoMarcarLidos(() => this.marcarLidos());
    await this.carregarAlertas();
  }

  async carregarAlertas() {
    try {
      this.listaAlertas = await this.notificacoes.listarDoUsuario(this.usuario.id);
      this.mostrarAlertas(this.somenteNaoLidos);
    } catch (erro) {
      this.tratarErro(erro);
    }
  }

  mostrarAlertas(somenteNaoLidos = false) {
    this.somenteNaoLidos = somenteNaoLidos;
    const todos = this.listaAlertas ?? [];
    this.view.mostrarAlertas(somenteNaoLidos ? todos.filter((n) => !n.lida) : todos, todos.filter((n) => !n.lida).length);
  }

  async marcarLidos() {
    const naoLidos = (this.listaAlertas ?? []).filter((n) => !n.lida);
    if (!naoLidos.length) return;
    try {
      await this.notificacoes.marcarComoLidas(naoLidos.map((n) => n.id));
      Toast.sucesso('Alertas marcados como lidos.');
      await this.carregarAlertas();
    } catch (erro) {
      this.tratarErro(erro);
    }
  }
}
