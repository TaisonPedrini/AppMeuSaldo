import { View } from '../../core/View.js';
import { html, seguro } from '../../utils/html.js';
import { formatarMoeda } from '../../utils/moeda.js';
import { formatarData } from '../../utils/data.js';
import { TipoCategoria } from '../../models/enums.js';
import { barraProgresso, valorComSinal } from '../components/indicadores.js';

// No celular a navegação inferior tem só 5 itens; os demais cadastros ficam nestes atalhos.
// No PC eles ficam ocultos, porque a barra lateral já leva a todas as telas.
const ATALHOS = [
  { caminho: '/orcamentos', texto: 'Orçamento' },
  { caminho: '/alertas', texto: 'Alertas' },
  { caminho: '/metas', texto: 'Metas' },
  { caminho: '/projecao', texto: 'Projeção do mês' },
  { caminho: '/cartoes', texto: 'Cartões' },
  { caminho: '/categorias', texto: 'Categorias' },
  { caminho: '/grupo/gerenciar', texto: 'Grupo' },
];

/** Painel inicial do grupo: saldo projetado, alerta de orçamento, gastos por pessoa e últimos lançamentos. */
export class InicioView extends View {
  template({ nomeUsuario, mes }) {
    return html`
      <section class="pagina">
        <header class="pagina-cabecalho">
          <div>
            <h1>Olá, ${nomeUsuario}</h1>
            <p class="texto-secundario">Resumo de ${mes}</p>
          </div>
          <div class="pagina-acoes">
            <a class="pilula-alerta" href="#/alertas" data-alertas hidden></a>
            <a class="botao botao--secundario" href="#/receitas/nova">+ Nova receita</a>
          </div>
        </header>

        <div class="painel-topo">
          <a class="cartao-destaque" href="#/projecao" data-saldo>
            <span>Saldo projetado</span>
            <strong>…</strong>
          </a>
          <div data-alerta></div>
        </div>

        <div class="painel-grade">
          <div class="cartao">
            <h2>Gastos do mês por pessoa</h2>
            <div data-pessoas></div>
          </div>
          <div class="cartao">
            <div class="lista-item-linha">
              <h2>Últimos lançamentos</h2>
              <a class="link-acao" href="#/lancamentos">Ver todos</a>
            </div>
            <ul class="lista lista--sem-borda" data-ultimos></ul>
            <p class="texto-secundario" data-sem-lancamentos hidden>Nenhum lançamento neste mês ainda.</p>
          </div>
        </div>

        <nav class="somente-celular" aria-label="Atalhos">
          <h2>Atalhos</h2>
          <ul class="lista-atalhos">
            ${ATALHOS.map((a) => html`<li><a class="cartao atalho" href="#${a.caminho}">${a.texto}</a></li>`)}
          </ul>
        </nav>
      </section>`;
  }

  mostrarPainel({ projecao, alerta, temLimites, gastosPorPessoa, ultimos, alertasNaoLidos }) {
    this.$('[data-saldo]').innerHTML = String(html`
      <span>Saldo projetado em ${formatarData(projecao.dataProjecao).slice(0, 5)}</span>
      <strong>${formatarMoeda(projecao.saldoProjetado)}</strong>
      <span>Receitas ${formatarMoeda(projecao.receitas)} · Despesas ${formatarMoeda(projecao.despesas + projecao.totalFuturas)}</span>`);

    this.$('[data-alerta]').innerHTML = String(alerta
      ? html`
        <a class="cartao-alerta ${alerta.situacao === 'EXCEDIDO' ? 'cartao-alerta--perigo' : ''}" href="#/orcamentos">
          <span class="lista-item-linha">
            <strong>${alerta.situacao === 'EXCEDIDO' ? 'Limite ultrapassado' : 'Alerta de orçamento'}: ${alerta.categoria}</strong>
            <strong>${Math.round(alerta.fracao * 100)}%</strong>
          </span>
          <span>${formatarMoeda(alerta.utilizado)} de ${formatarMoeda(alerta.orcamento.limite)}</span>
          ${barraProgresso(alerta.fracao, `Uso do limite de ${alerta.categoria}`)}
        </a>`
      : html`
        <a class="cartao cartao-alerta--neutro" href="#/orcamentos">
          <strong>${temLimites ? 'Orçamento sob controle' : 'Defina limites por categoria'}</strong>
          <span class="texto-secundario">${temLimites
            ? 'Nenhuma categoria passou de 80% do limite neste mês.'
            : 'Com limites definidos, o app avisa antes de o orçamento estourar.'}</span>
        </a>`);

    const maior = Math.max(...gastosPorPessoa.map((p) => p.valor), 1);
    this.$('[data-pessoas]').innerHTML = gastosPorPessoa.map((p) => String(html`
      <div class="gasto-pessoa">
        <span class="lista-item-linha"><span>${p.nome}</span><strong>${formatarMoeda(p.valor)}</strong></span>
        <div class="progresso progresso--${p.cor}" aria-hidden="true"><span style="${seguro(`width: ${Math.round((p.valor / maior) * 100)}%`)}"></span></div>
      </div>`)).join('');

    this.$('[data-ultimos]').innerHTML = ultimos.map((l) => String(html`
      <li class="lista-item">
        <span class="lista-item-textos"><strong>${l.descricao}</strong><span>${formatarData(l.data)} · ${l.pessoa}</span></span>
        ${valorComSinal(l.valor, l.tipo === TipoCategoria.RECEITA)}
      </li>`)).join('');
    this.$('[data-sem-lancamentos]').hidden = ultimos.length > 0;

    const pilula = this.$('[data-alertas]');
    pilula.hidden = alertasNaoLidos === 0;
    pilula.textContent = `${alertasNaoLidos} ${alertasNaoLidos === 1 ? 'alerta' : 'alertas'}`;
  }
}
