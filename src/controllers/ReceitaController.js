import { Controller } from '../core/Controller.js';

/** UC04 — Cadastrar receita. */
export class ReceitaController extends Controller {
  nova() {
    this.pendente('Nova receita', ['UC04']);
  }
}
