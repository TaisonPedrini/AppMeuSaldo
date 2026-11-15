// Moldura da aplicação. No celular: cabeçalho e navegação inferior do protótipo
// (Início, Lançamentos, +, Terceiros, Relatórios). No PC (≥ 1024px): barra lateral
// com todas as seções, como nas telas "versão PC" do Figma.
import { html, seguro } from '../../utils/html.js';
import { iniciais } from '../../utils/texto.js';
import { logoIcone } from '../components/logo.js';

const ICONES = {
  inicio: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  lancamentos: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  terceiros: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  relatorios: '<path d="M12 20V10M18 20V4M6 20v-4"/>',
  orcamento: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
  metas: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  alertas: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  projecao: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  cartoes: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  categorias: '<path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.59-8.59a1 1 0 0 0 0-1.41z"/><circle cx="7" cy="7" r="1"/>',
  grupo: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  sair: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
};

/** Navegação inferior (celular), igual ao protótipo. */
const NAVEGACAO_INFERIOR = [
  { caminho: '/', rotulo: 'Início', icone: 'inicio' },
  { caminho: '/lancamentos', rotulo: 'Lançamentos', icone: 'lancamentos' },
  { caminho: '/despesas/nova', rotulo: 'Nova despesa', icone: 'mais', destaque: true },
  { caminho: '/terceiros', rotulo: 'Terceiros', icone: 'terceiros' },
  { caminho: '/relatorios', rotulo: 'Relatórios', icone: 'relatorios' },
];

/** Barra lateral (PC): todas as seções, agrupadas como no Figma. */
const SECOES_LATERAIS = [
  { titulo: 'Principal', itens: [
    { caminho: '/', rotulo: 'Início', icone: 'inicio' },
    { caminho: '/lancamentos', rotulo: 'Lançamentos', icone: 'lancamentos' },
    { caminho: '/terceiros', rotulo: 'Terceiros', icone: 'terceiros' },
    { caminho: '/relatorios', rotulo: 'Relatórios', icone: 'relatorios' },
  ] },
  { titulo: 'Planejamento', itens: [
    { caminho: '/orcamentos', rotulo: 'Orçamento', icone: 'orcamento' },
    { caminho: '/metas', rotulo: 'Metas', icone: 'metas' },
    { caminho: '/alertas', rotulo: 'Alertas', icone: 'alertas' },
    { caminho: '/projecao', rotulo: 'Projeção', icone: 'projecao' },
  ] },
  { titulo: 'Cadastros', itens: [
    { caminho: '/cartoes', rotulo: 'Cartões', icone: 'cartoes' },
    { caminho: '/categorias', rotulo: 'Categorias', icone: 'categorias' },
    { caminho: '/grupo/gerenciar', rotulo: 'Grupo financeiro', icone: 'grupo' },
  ] },
];

function icone(nome, tamanho = 24) {
  return seguro(`<svg viewBox="0 0 24 24" width="${tamanho}" height="${tamanho}" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[nome]}</svg>`);
}

/** Item ativo: "/" só na raiz; os demais pelo prefixo do caminho. */
function ativo(item, caminho) {
  if (item.caminho === '/') return caminho === '/';
  return caminho.startsWith(item.caminho);
}

/** Na barra lateral não há o botão "+", então Nova despesa e Nova receita marcam Lançamentos. */
function ativoNaLateral(item, caminho) {
  if (item.caminho === '/lancamentos') return /^\/(lancamentos|despesas|receitas)/.test(caminho);
  return ativo(item, caminho);
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

  /**
   * Tela com navegação. Retorna a área de conteúdo.
   * @param {string} caminho rota atual, para marcar o item ativo
   * @param {{ nome: string, email: string } | null} usuario quem está logado (mostrado na barra lateral)
   */
  completo(caminho, usuario = null) {
    this.raiz.innerHTML = String(html`
      <div class="app-shell">
        <aside class="lateral" aria-label="Menu">
          <a class="lateral-marca" href="#/">
            ${logoIcone(32)}
            <span>MeuSaldo</span>
          </a>
          <a class="botao botao--primario botao--bloco" href="#/despesas/nova">+ Nova despesa</a>
          <nav aria-label="Navegação principal">
            ${SECOES_LATERAIS.map((secao) => html`
              <p class="lateral-secao">${secao.titulo}</p>
              <ul class="lateral-lista">
                ${secao.itens.map((item) => html`
                  <li>
                    <a href="#${item.caminho}" class="lateral-item" ${ativoNaLateral(item, caminho) ? seguro('aria-current="page"') : ''}>
                      ${icone(item.icone, 20)}<span>${item.rotulo}</span>
                    </a>
                  </li>`)}
              </ul>`)}
          </nav>
          ${usuario ? html`
            <div class="lateral-usuario">
              <span class="avatar" aria-hidden="true">${iniciais(usuario.nome)}</span>
              <span class="lateral-usuario-dados">
                <strong>${usuario.nome}</strong>
                <span class="texto-secundario">${usuario.email}</span>
              </span>
              ${this.aoSair ? html`
                <button type="button" class="botao-icone" data-acao="sair" aria-label="Sair" title="Sair">${icone('sair', 20)}</button>` : ''}
            </div>` : ''}
        </aside>

        <header class="topo">
          <a class="marca" href="#/">${logoIcone(26)}<span>MeuSaldo</span></a>
          ${this.aoSair ? html`<button type="button" class="botao-texto" data-acao="sair">Sair</button>` : ''}
        </header>

        <main id="conteudo" class="conteudo"></main>

        <nav class="nav-inferior" aria-label="Navegação principal">
          ${NAVEGACAO_INFERIOR.map((item) => html`
            <a href="#${item.caminho}"
              class="nav-item ${item.destaque ? 'nav-item--destaque' : ''}"
              ${ativo(item, caminho) ? seguro('aria-current="page"') : ''}
              ${item.destaque ? seguro(`aria-label="${item.rotulo}"`) : ''}>
              ${icone(item.icone)}
              ${item.destaque ? '' : html`<span>${item.rotulo}</span>`}
            </a>`)}
        </nav>
      </div>`);

    this.raiz.querySelectorAll('[data-acao="sair"]').forEach((botao) => botao.addEventListener('click', () => this.aoSair()));
    return this.raiz.querySelector('#conteudo');
  }
}
