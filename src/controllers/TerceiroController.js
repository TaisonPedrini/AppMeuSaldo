import { Controller } from '../core/Controller.js';

/** UC03 — Gerenciar terceiros; UC11 — Registrar reembolso de terceiro. */
export class TerceiroController extends Controller {
  index() {
    this.pendente('Terceiros', ['UC03']);
  }

  reembolso() {
    this.pendente('Registrar reembolso', ['UC11']);
  }
}
