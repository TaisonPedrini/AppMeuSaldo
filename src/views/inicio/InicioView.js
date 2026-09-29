import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';

const ATALHOS = [
  { caminho: '/receitas/nova', texto: 'Nova receita' },
  { caminho: '/categorias', texto: 'Categorias' },
  { caminho: '/cartoes', texto: 'Cartões' },
  { caminho: '/orcamentos', texto: 'Orçamentos' },
  { caminho: '/metas', texto: 'Metas' },
  { caminho: '/projecao', texto: 'Projeção do mês' },
  { caminho: '/grupo/gerenciar', texto: 'Grupo' },
];

export class InicioView extends View {
  template({ nomeUsuario }) {
    return html`
      <section class="pagina">
        <h1>Olá, ${nomeUsuario}</h1>
        <div class="cartao cartao--vazio">
          <p class="texto-secundario">Saldo, alertas e indicadores do mês aparecerão aqui (UC13, UC15, UC16).</p>
        </div>
        <h2>Atalhos</h2>
        <ul class="lista-atalhos">
          ${ATALHOS.map((a) => html`<li><a class="cartao atalho" href="#${a.caminho}">${a.texto}</a></li>`)}
        </ul>
      </section>`;
  }
}
