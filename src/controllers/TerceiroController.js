import { Controller } from '../core/Controller.js';
import { Terceiro } from '../models/Terceiro.js';
import { Reembolso } from '../models/Reembolso.js';
import { TerceiroRepository } from '../repositories/TerceiroRepository.js';
import { ReembolsoRepository } from '../repositories/ReembolsoRepository.js';
import { ReembolsoService } from '../services/ReembolsoService.js';
import { TerceirosView } from '../views/terceiros/TerceirosView.js';
import { ReembolsoView } from '../views/terceiros/ReembolsoView.js';
import { Toast } from '../views/components/Toast.js';
import { paraCentavos } from '../utils/moeda.js';
import { hojeISO } from '../utils/data.js';

/** UC03 — Gerenciar terceiros; UC11 — Registrar reembolso de terceiro. */
export class TerceiroController extends Controller {
  async index() {
    this.repositorio = new TerceiroRepository(this.grupoId);
    this.view = new TerceirosView(this.conteudo).render();
    this.view.aoAdicionar((dados) => this.adicionar(dados));
    await this.carregarTerceiros();
  }

  async carregarTerceiros() {
    try {
      this.view.mostrarTerceiros(await this.repositorio.listarTodos());
    } catch (erro) {
      this.tratarErro(erro);
    }
  }

  async adicionar(dados) {
    this.view.limparErros();
    this.view.ocupado(true);
    try {
      await this.repositorio.criar(new Terceiro({ nome: dados.nome?.trim() }));
      Toast.sucesso('Terceiro adicionado.');
      this.view.limparFormulario();
      await this.carregarTerceiros();
    } catch (erro) {
      this.tratarErro(erro, this.view);
    } finally {
      this.view.ocupado(false);
    }
  }

  /** UC11: mostra o saldo devedor e o histórico de pagamentos, e registra um novo reembolso. */
  async reembolso() {
    const terceiroId = this.params.id;
    this.view = new ReembolsoView(this.conteudo);
    this.reembolsos = new ReembolsoRepository(this.grupoId, terceiroId);

    try {
      const terceiro = await new TerceiroRepository(this.grupoId).buscarPorId(terceiroId);
      if (!terceiro) {
        Toast.erro('Terceiro não encontrado. Escolha um terceiro na lista.');
        this.navegar('/terceiros');
        return;
      }
      this.terceiro = terceiro;
      this.view.render({ terceiro, hoje: hojeISO() });
    } catch (erro) {
      this.tratarErro(erro);
      return;
    }

    this.view.aoRegistrar((dados) => this.registrarReembolso(dados));
    this.view.aoCarregarMais(() => this.carregarReembolsos());
    await this.carregarReembolsos({ substituir: true });
  }

  async carregarReembolsos({ substituir = false } = {}) {
    try {
      const { itens, cursor } = await this.reembolsos.listar({ cursor: substituir ? null : this.cursor });
      this.cursor = cursor;
      this.view.mostrarReembolsos(itens, { haMais: Boolean(cursor), substituir });
    } catch (erro) {
      this.tratarErro(erro);
    }
  }

  async registrarReembolso(dados) {
    this.view.limparErros();
    this.view.ocupado(true);
    try {
      const novoSaldo = await new ReembolsoService(this.grupoId).registrar(new Reembolso({
        valor: paraCentavos(dados.valor),
        data: dados.data,
        terceiroId: this.terceiro.id,
      }));
      this.terceiro.saldoDevedor = novoSaldo;
      Toast.sucesso('Reembolso registrado.');
      this.view.atualizarSaldo(novoSaldo);
      this.view.limparFormulario();
      await this.carregarReembolsos({ substituir: true });
    } catch (erro) {
      this.tratarErro(erro, this.view);
    } finally {
      this.view.ocupado(false);
    }
  }
}
