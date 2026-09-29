import { Controller } from '../core/Controller.js';

/** UC14 — Gerenciar metas de economia. */
export class MetaController extends Controller {
  index() {
    this.pendente('Metas de economia', ['UC14']);
  }
}
