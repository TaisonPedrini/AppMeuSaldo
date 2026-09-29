import { Controller } from '../core/Controller.js';

/** UC15 — Consultar projeção financeira (ver ProjecaoService). */
export class ProjecaoController extends Controller {
  index() {
    this.pendente('Projeção do mês', ['UC15']);
  }
}
