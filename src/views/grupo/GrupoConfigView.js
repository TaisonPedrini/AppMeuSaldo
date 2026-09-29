import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';
import { campo } from '../components/campos.js';

/** Primeiro acesso: criar o grupo do casal ou entrar com o código de convite (UC02). */
export class GrupoConfigView extends View {
  template({ nomeUsuario }) {
    return html`
      <section class="pagina">
        <h1>Olá, ${nomeUsuario}</h1>
        <p class="texto-secundario">Para começar, crie o grupo do casal ou entre no grupo que seu parceiro ou parceira criou.</p>

        <form class="cartao formulario" data-form="criar" novalidate>
          <h2>Criar grupo</h2>
          ${campo({ nome: 'nome', texto: 'Nome do grupo', obrigatorio: true, atributos: 'placeholder="Ex.: Casa Silva Costa"' })}
          <button type="submit" class="botao botao--primario">Criar grupo</button>
        </form>

        <form class="cartao formulario" data-form="entrar" novalidate>
          <h2>Tenho um código de convite</h2>
          ${campo({ nome: 'codigo', texto: 'Código de convite', obrigatorio: true, atributos: 'autocapitalize="characters" autocomplete="off"' })}
          <button type="submit" class="botao botao--secundario">Entrar no grupo</button>
        </form>
      </section>`;
  }

  aoCriar(handler) {
    this.aoEnviar('[data-form="criar"]', handler);
  }

  aoEntrarComCodigo(handler) {
    this.aoEnviar('[data-form="entrar"]', handler);
  }
}
