import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';

export class LoginView extends View {
  template() {
    return html`
      <section class="login">
        <h1 class="marca marca--grande">MeuSaldo</h1>
        <p class="texto-secundario">As finanças do casal em um só lugar.</p>
        <button type="button" class="botao botao--primario" data-acao="entrar">Entrar com Google</button>
      </section>`;
  }

  aoEntrar(handler) {
    this.on('click', '[data-acao="entrar"]', handler);
  }
}
