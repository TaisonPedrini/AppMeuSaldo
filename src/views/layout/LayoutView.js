// Moldura da aplicação: cabeçalho e navegação inferior do protótipo
// (Início, Lançamentos, +, Terceiros, Relatórios).
import { html, seguro } from '../../utils/html.js';

const ICONES = {
  inicio: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  lancamentos: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  terceiros: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  relatorios: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
};

const NAVEGACAO = [
  { caminho: '/', rotulo: 'Início', icone: 'inicio' },
  { caminho: '/lancamentos', rotulo: 'Lançamentos', icone: 'lancamentos' },
  { caminho: '/despesas/nova', rotulo: 'Nova despesa', icone: 'mais', destaque: true },
  { caminho: '/terceiros', rotulo: 'Terceiros', icone: 'terceiros' },
  { caminho: '/relatorios', rotulo: 'Relatórios', icone: 'relatorios' },
];

function icone(nome) {
  return seguro(`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[nome]}</svg>`);
}

function ativo(item, caminho) {
  return item.caminho === '/' ? caminho === '/' : caminho.startsWith(item.caminho);
}

export class LayoutView {
  /** @param {{ aoSair: (() => void) | null }} opcoes sem aoSair, o botão "Sair" não aparece */
  constructor(raiz, { aoSair }) {
    this.raiz = raiz;
    this.aoSair = aoSair;
  }

  /** Tela sem navegação (login, criação do grupo). Retorna a área de conteúdo. */
  simples() {
    this.raiz.innerHTML = '<main id="conteudo" class="conteudo conteudo--simples"></main>';
    return this.raiz.querySelector('#conteudo');
  }

  /** Tela com cabeçalho e navegação inferior. Retorna a área de conteúdo. */
  completo(caminho) {
    this.raiz.innerHTML = String(html`
      <div class="app-shell">
        <header class="topo">
          <a class="marca" href="#/">MeuSaldo</a>
          ${this.aoSair ? html`<button type="button" class="botao-texto" data-acao="sair">Sair</button>` : ''}
        </header>
        <main id="conteudo" class="conteudo"></main>
        <nav class="nav-inferior" aria-label="Navegação principal">
          ${NAVEGACAO.map((item) => html`
            <a href="#${item.caminho}"
              class="nav-item ${item.destaque ? 'nav-item--destaque' : ''}"
              ${ativo(item, caminho) ? seguro('aria-current="page"') : ''}
              ${item.destaque ? seguro(`aria-label="${item.rotulo}"`) : ''}>
              ${icone(item.icone)}
              ${item.destaque ? '' : html`<span>${item.rotulo}</span>`}
            </a>`)}
        </nav>
      </div>`);

    this.raiz.querySelector('[data-acao="sair"]')?.addEventListener('click', () => this.aoSair());
    return this.raiz.querySelector('#conteudo');
  }
}
