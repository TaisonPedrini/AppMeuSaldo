import { Controller } from '../core/Controller.js';
import { ErroValidacao } from '../core/erros.js';
import { RelatorioService } from '../services/RelatorioService.js';
import { RelatorioPdfService } from '../services/RelatorioPdfService.js';
import { RelatoriosView } from '../views/relatorios/RelatoriosView.js';
import { Toast } from '../views/components/Toast.js';
import { hojeISO, nomeDoMes, periodoDe } from '../utils/data.js';

/** UC16 — Consultar indicadores financeiros; UC18 — Gerar relatório em PDF («extend» UC16). */
export class RelatorioController extends Controller {
  async index() {
    this.periodo = periodoDe(hojeISO());
    this.view = new RelatoriosView(this.conteudo).render({ periodo: this.periodo });
    this.view.aoMudarPeriodo((periodo) => {
      if (!periodo || periodo === this.periodo) return;
      this.periodo = periodo;
      this.carregar();
    });
    this.view.aoGerarPdf((secoes) => this.gerarPdf(secoes));
    await this.carregar();
  }

  async carregar() {
    try {
      this.indicadores = await new RelatorioService(this.grupoId).indicadores(this.periodo, this.usuario);
      this.view.mostrarIndicadores({ ...this.indicadores, mes: nomeDoMes(this.periodo) });
    } catch (erro) {
      this.indicadores = null;
      this.tratarErro(erro);
    }
  }

  async gerarPdf(secoes) {
    this.view.limparErros();
    if (!secoes.length) {
      this.tratarErro(new ErroValidacao([{ campo: 'secoes', mensagem: 'Escolha pelo menos uma seção para o relatório.' }]), this.view);
      return;
    }
    if (!this.indicadores) {
      Toast.erro('Os dados do mês não foram carregados. Recarregue a página e tente novamente.');
      return;
    }

    this.view.ocupado(true, '[data-acao="pdf"]');
    try {
      await RelatorioPdfService.gerar({
        mes: nomeDoMes(this.periodo),
        nomeArquivo: `meusaldo-relatorio-${this.periodo}.pdf`,
        secoes,
        indicadores: this.indicadores,
      });
      Toast.sucesso('Relatório gerado. Confira a pasta de downloads.');
    } catch (erro) {
      this.tratarErro(erro);
    } finally {
      this.view.ocupado(false, '[data-acao="pdf"]');
    }
  }
}
