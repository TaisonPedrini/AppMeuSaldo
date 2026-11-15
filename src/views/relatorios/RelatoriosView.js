import { View } from '../../core/View.js';
import { html, seguro } from '../../utils/html.js';
import { formatarMoeda } from '../../utils/moeda.js';
import { SecoesRelatorio } from '../../models/enums.js';
import { ligarSeletorMes, seletorMes } from '../components/seletorMes.js';

const OPCOES_PDF = [
  { valor: SecoesRelatorio.RESUMO, texto: 'Resumo (receitas, despesas e economia)' },
  { valor: SecoesRelatorio.CATEGORIAS, texto: 'Despesas por categoria' },
  { valor: SecoesRelatorio.PESSOAS, texto: 'Gastos por pessoa' },
  { valor: SecoesRelatorio.TERCEIROS, texto: 'Terceiros e saldo devedor' },
  { valor: SecoesRelatorio.ORCAMENTO, texto: 'Orçamento por categoria' },
  { valor: SecoesRelatorio.MOVIMENTACOES, texto: 'Lista de movimentações' },
];

const CORES_PESSOA = ['pessoa-1', 'pessoa-2', 'terceiros'];

/** Indicadores financeiros do mês (UC16) e geração do relatório em PDF (UC18). */
export class RelatoriosView extends View {
  template({ periodo }) {
    return html`
      <section class="pagina">
        <header class="pagina-cabecalho">
          <div>
            <h1>Relatórios</h1>
            <p class="texto-secundario">Indicadores financeiros · <span data-mes></span></p>
          </div>
          ${seletorMes(periodo)}
        </header>

        <div class="indicadores">
          <div class="cartao indicador"><span class="indicador-rotulo">Receitas</span><span class="indicador-valor valor-positivo" data-receitas>—</span></div>
          <div class="cartao indicador"><span class="indicador-rotulo">Despesas</span><span class="indicador-valor valor-negativo" data-despesas>—</span></div>
          <div class="cartao indicador"><span class="indicador-rotulo">Economia</span><span class="indicador-valor" data-economia>—</span></div>
          <div class="cartao indicador"><span class="indicador-rotulo">Maior gasto</span><span class="indicador-valor" data-maior>—</span></div>
        </div>

        <div class="pagina-dupla">
          <div class="pagina">
            <div class="cartao">
              <h2>Despesas por categoria</h2>
              <ul class="grafico-barras" data-categorias></ul>
              <p class="texto-secundario" data-sem-despesas hidden>Nenhuma despesa neste mês.</p>
            </div>
            <div class="cartao">
              <h2>Por pessoa</h2>
              <div data-pessoas></div>
            </div>
          </div>

          <form class="cartao formulario" data-form="pdf" novalidate>
            <h2>Relatório em PDF</h2>
            <fieldset class="campo">
              <legend>Incluir no relatório</legend>
              <div class="lista-opcoes">
                ${OPCOES_PDF.map((o) => html`
                  <label class="campo--checkbox">
                    <input type="checkbox" name="secoes" value="${o.valor}" checked>
                    <span>${o.texto}</span>
                  </label>`)}
              </div>
              <input type="hidden" name="secoes-erro">
            </fieldset>
            <button type="submit" class="botao botao--primario botao--bloco" data-acao="pdf">Baixar PDF</button>
          </form>
        </div>
      </section>`;
  }

  mostrarIndicadores({ totais, maiorGasto, despesasPorCategoria, porPessoa, mes }) {
    this.$('[data-mes]').textContent = mes;
    this.$('[data-receitas]').textContent = formatarMoeda(totais.receitas);
    this.$('[data-despesas]').textContent = formatarMoeda(totais.despesas);
    const economia = this.$('[data-economia]');
    economia.textContent = formatarMoeda(totais.saldo);
    economia.className = `indicador-valor ${totais.saldo < 0 ? 'valor-negativo' : 'valor-positivo'}`;
    this.$('[data-maior]').textContent = maiorGasto?.nome ?? '—';

    const maior = Math.max(...despesasPorCategoria.map((c) => c.valor), 1);
    this.$('[data-categorias]').innerHTML = despesasPorCategoria.map((c) => String(html`
      <li class="grafico-barra">
        <span class="grafico-rotulo">${c.nome}</span>
        <span class="grafico-trilho"><span style="${seguro(`width: ${Math.max(Math.round((c.valor / maior) * 100), 2)}%`)}"></span></span>
        <span class="grafico-valor">${formatarMoeda(c.valor)}</span>
      </li>`)).join('');
    this.$('[data-sem-despesas]').hidden = despesasPorCategoria.length > 0;

    const maiorPessoa = Math.max(...porPessoa.map((p) => p.valor), 1);
    this.$('[data-pessoas]').innerHTML = porPessoa.map((p, i) => String(html`
      <div class="gasto-pessoa">
        <span class="lista-item-linha"><span>${p.nome}</span><strong>${formatarMoeda(p.valor)}</strong></span>
        <div class="progresso progresso--${CORES_PESSOA[i]}" aria-hidden="true"><span style="${seguro(`width: ${Math.round((p.valor / maiorPessoa) * 100)}%`)}"></span></div>
      </div>`)).join('');
  }

  aoMudarPeriodo(handler) {
    ligarSeletorMes(this, handler);
  }

  aoGerarPdf(handler) {
    this.on('submit', '[data-form="pdf"]', (e, form) => {
      e.preventDefault();
      handler(new FormData(form).getAll('secoes'));
    });
  }

  /** O erro de "nenhuma seção" aparece junto da lista de opções. */
  mostrarErros(erros) {
    super.mostrarErros(erros.map((e) => (e.campo === 'secoes' ? { ...e, campo: 'secoes-erro' } : e)));
  }
}
