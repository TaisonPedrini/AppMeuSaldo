import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';
import { formatarMoeda } from '../../utils/moeda.js';
import { formatarData } from '../../utils/data.js';
import { valorComSinal } from '../components/indicadores.js';
import { ligarSeletorMes, seletorMes } from '../components/seletorMes.js';

/** Saldo projetado para o fim do mês e como ele é composto (UC15). */
export class ProjecaoView extends View {
  template({ periodo }) {
    return html`
      <section class="pagina">
        <header class="pagina-cabecalho">
          <div>
            <h1>Projeção do mês</h1>
            <p class="texto-secundario" data-mes></p>
          </div>
          ${seletorMes(periodo)}
        </header>

        <div class="pagina-dupla pagina-dupla--larga">
          <div class="pagina">
            <div class="cartao-destaque" data-destaque>
              <span>Saldo projetado</span>
              <strong>…</strong>
            </div>

            <div class="cartao">
              <h2>Composição</h2>
              <dl class="composicao" data-composicao></dl>
            </div>
          </div>

          <div class="cartao">
            <h2>Próximas contas</h2>
            <p class="legenda">Despesas recorrentes que ainda vão acontecer neste mês.</p>
            <ul class="lista lista--sem-borda" data-contas></ul>
            <p class="texto-secundario" data-sem-contas hidden>Nenhuma conta recorrente prevista para o restante do mês.</p>
          </div>
        </div>
      </section>`;
  }

  mostrarProjecao({ receitas, despesas, saldoAtual, contasFuturas, totalFuturas, saldoProjetado, dataProjecao, mes }) {
    this.$('[data-mes]').textContent = `Planejamento › ${mes}`;
    this.$('[data-destaque]').innerHTML = String(html`
      <span>Saldo projetado em ${formatarData(dataProjecao)}</span>
      <strong>${formatarMoeda(saldoProjetado)}</strong>
      <span>Considera as receitas e despesas lançadas no mês e as contas recorrentes que ainda vão vencer.</span>`);

    const linha = (rotulo, valor, sinal) => html`
      <div class="composicao-linha">
        <dt>${rotulo}</dt>
        <dd>${sinal === undefined ? formatarMoeda(valor) : valorComSinal(valor, sinal)}</dd>
      </div>`;
    this.$('[data-composicao]').innerHTML = String(html`
      ${linha('Receitas do mês', receitas, true)}
      ${linha('Despesas lançadas', despesas, false)}
      ${linha('Saldo atual', saldoAtual)}
      ${linha('Contas futuras', totalFuturas, false)}
      <div class="composicao-linha composicao-total">
        <dt>Saldo projetado</dt>
        <dd class="${saldoProjetado < 0 ? 'valor-negativo' : ''}">${formatarMoeda(saldoProjetado)}</dd>
      </div>`);

    this.$('[data-contas]').innerHTML = contasFuturas.map((c) => String(html`
      <li class="lista-item">
        <span class="lista-item-textos"><strong>${c.descricao}</strong><span>${formatarData(c.data)} · recorrente</span></span>
        ${valorComSinal(c.valor, false)}
      </li>`)).join('');
    this.$('[data-sem-contas]').hidden = contasFuturas.length > 0;
  }

  aoMudarPeriodo(handler) {
    ligarSeletorMes(this, handler);
  }
}
