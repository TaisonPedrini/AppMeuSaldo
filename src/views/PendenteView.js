import { View } from '../core/View.js';
import { html } from '../utils/html.js';

/** Marcador de tela ainda não implementada, com os casos de uso que ela deve cobrir. */
export class PendenteView extends View {
  template({ titulo, casosDeUso }) {
    return html`
      <section class="pagina">
        <h1>${titulo}</h1>
        <div class="cartao cartao--vazio">
          <p>Esta tela ainda está em construção.</p>
          <p class="texto-secundario">Casos de uso: ${casosDeUso.join(', ')}</p>
        </div>
      </section>`;
  }
}
