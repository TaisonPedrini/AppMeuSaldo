import { View } from '../../core/View.js';
import { html, seguro } from '../../utils/html.js';
import { rotulo } from '../components/campos.js';

const ICONE_OLHO = seguro(`
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path class="olho-aberto" d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/>
    <circle class="olho-aberto" cx="12" cy="12" r="3"/>
    <path class="olho-fechado" d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>
  </svg>`);

/** Cabeçalho comum das telas de acesso: marca e subtítulo opcional. */
export function cabecalhoAcesso(subtitulo = '') {
  return html`
    <header class="acesso-cabecalho">
      <h1 class="acesso-titulo">MeuSaldo</h1>
      ${subtitulo ? html`<p class="acesso-subtitulo">${subtitulo}</p>` : ''}
    </header>`;
}

/** Campo de senha com botão para mostrar ou ocultar o que foi digitado. */
export function campoSenha({ nome, texto, autocomplete, dica = '' }) {
  const idDica = `dica-${nome}`;
  return html`
    <div class="campo">
      <label for="${nome}">${rotulo(texto, true)}</label>
      <div class="campo-senha">
        <input id="${nome}" name="${nome}" type="password" autocomplete="${autocomplete}" required
          ${dica ? seguro(`aria-describedby="${idDica}"`) : ''}>
        <button type="button" class="alternar-senha" data-acao="alternar-senha"
          aria-label="Mostrar senha" aria-pressed="false">${ICONE_OLHO}</button>
      </div>
      ${dica ? html`<p class="legenda campo-dica" id="${idDica}">${dica}</p>` : ''}
    </div>`;
}

/** Base das telas de login e cadastro: mostrar senha e limpar o erro assim que o campo é corrigido. */
export class AuthView extends View {
  constructor(raiz) {
    super(raiz);

    this.on('click', '[data-acao="alternar-senha"]', (_e, botao) => {
      const input = botao.parentElement.querySelector('input');
      const mostrar = input.type === 'password';
      input.type = mostrar ? 'text' : 'password';
      botao.setAttribute('aria-pressed', String(mostrar));
      botao.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
      input.focus();
    });

    this.on('input', '[aria-invalid="true"]', (_e, input) => this.limparErroDo(input));
  }

  limparErroDo(input) {
    this.raiz.querySelector(`#erro-${CSS.escape(input.name)}`)?.remove();
    input.removeAttribute('aria-invalid');
    const dica = this.raiz.querySelector(`#dica-${CSS.escape(input.name)}`);
    if (dica) input.setAttribute('aria-describedby', dica.id);
    else input.removeAttribute('aria-describedby');
  }
}
