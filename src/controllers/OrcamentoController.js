import { Controller } from '../core/Controller.js';

/** UC12 — Gerenciar orçamento; UC13 — Visualizar alertas de orçamento. */
export class OrcamentoController extends Controller {
  index() {
    this.pendente('Orçamentos', ['UC12', 'UC13']);
  }
}
