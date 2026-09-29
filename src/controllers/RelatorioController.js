import { Controller } from '../core/Controller.js';

/** UC16 — Consultar indicadores; UC18 — Gerar relatório em PDF (ver RelatorioPdfService). */
export class RelatorioController extends Controller {
  index() {
    this.pendente('Relatórios', ['UC16', 'UC18']);
  }
}
