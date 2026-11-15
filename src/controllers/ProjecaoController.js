import { Controller } from '../core/Controller.js';
import { ProjecaoService } from '../services/ProjecaoService.js';
import { ProjecaoView } from '../views/projecao/ProjecaoView.js';
import { hojeISO, nomeDoMes, periodoDe } from '../utils/data.js';

/** UC15 — Consultar projeção financeira (RF019): saldo esperado ao fim do mês. */
export class ProjecaoController extends Controller {
  async index() {
    this.periodo = periodoDe(hojeISO());
    this.view = new ProjecaoView(this.conteudo).render({ periodo: this.periodo });
    this.view.aoMudarPeriodo((periodo) => {
      if (!periodo || periodo === this.periodo) return;
      this.periodo = periodo;
      this.carregar();
    });
    await this.carregar();
  }

  async carregar() {
    try {
      const projecao = await new ProjecaoService(this.grupoId).calcular(this.periodo);
      this.view.mostrarProjecao({ ...projecao, mes: nomeDoMes(this.periodo) });
    } catch (erro) {
      this.tratarErro(erro);
    }
  }
}
