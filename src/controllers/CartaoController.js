import { Controller } from '../core/Controller.js';

/** UC06 — Gerenciar cartões de crédito. */
export class CartaoController extends Controller {
  index() {
    this.pendente('Cartões', ['UC06']);
  }
}
