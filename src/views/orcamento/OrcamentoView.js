import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';
import { formatarMoeda } from '../../utils/moeda.js';
import { campoMoeda, selecao, legendaObrigatorios } from '../components/campos.js';
import { barraProgresso } from '../components/indicadores.js';
import { ligarSeletorMes, seletorMes } from '../components/seletorMes.js';

const SITUACOES = {
  OK: { texto: 'Dentro do limite', classe: 'etiqueta--quitado' },
  ATENCAO: { texto: 'Atenção', classe: 'etiqueta--atencao' },
  EXCEDIDO: { texto: 'Excedido', classe: 'etiqueta--devendo' },
};

/** Limites por categoria no mês e o quanto já foi usado de cada um (UC12, RF013). */
export class OrcamentoView extends View {
  template({ periodo }) {
    return html`
      <section class="pagina">
        <header class="pagina-cabecalho">
          <div>
            <h1>Orçamento</h1>
            <p class="texto-secundario">Limites por categoria · <span data-mes></span></p>
          </div>
          ${seletorMes(periodo)}
        </header>

        <div class="indicadores">
          <div class="cartao indicador">
            <span class="indicador-rotulo">Utilizado no mês</span>
            <span class="indicador-valor" data-utilizado>—</span>
            <span class="legenda" data-utilizado-detalhe></span>
          </div>
          <div class="cartao indicador">
            <span class="indicador-rotulo">Disponível</span>
            <span class="indicador-valor valor-positivo" data-disponivel>—</span>
          </div>
          <div class="cartao indicador">
            <span class="indicador-rotulo">Categorias em alerta</span>
            <span class="indicador-valor valor-negativo" data-em-alerta>—</span>
            <span class="legenda">a partir de 80% do limite</span>
          </div>
        </div>

        <div class="pagina-dupla">
          <div>
            <ul class="lista" data-lista></ul>
            <p class="cartao cartao--vazio texto-secundario" data-vazio hidden>
              Nenhum limite definido neste mês. Defina um limite para acompanhar os gastos da categoria.
            </p>
          </div>

          <form class="cartao formulario" data-form="limite" novalidate>
            <h2>Definir limite</h2>
            <div data-select-categoria></div>
            ${campoMoeda({ nome: 'limite', texto: 'Limite no mês', obrigatorio: true })}
            <p class="legenda">Se a categoria já tiver limite neste mês, o valor é substituído.</p>
            ${legendaObrigatorios()}
            <button type="submit" class="botao botao--primario botao--bloco">Salvar limite</button>
          </form>
        </div>
      </section>`;
  }

  mostrarResumo({ categorias, itens, totais, mes }) {
    this.$('[data-mes]').textContent = mes;

    const selecionada = this.$('[name="categoriaId"]')?.value ?? '';
    this.$('[data-select-categoria]').innerHTML = String(selecao({
      nome: 'categoriaId', texto: 'Categoria', obrigatorio: true, selecionado: selecionada,
      opcoes: categorias.map((c) => ({ valor: c.id, texto: c.nome })),
    }));

    const fracaoTotal = totais.limite ? totais.utilizado / totais.limite : 0;
    this.$('[data-utilizado]').textContent = `${Math.round(fracaoTotal * 100)}%`;
    this.$('[data-utilizado-detalhe]').textContent = `${formatarMoeda(totais.utilizado)} de ${formatarMoeda(totais.limite)}`;
    this.$('[data-disponivel]').textContent = formatarMoeda(Math.max(totais.limite - totais.utilizado, 0));
    this.$('[data-em-alerta]').textContent = String(itens.filter((i) => i.situacao !== 'OK').length);

    this.$('[data-lista]').innerHTML = itens.map((i) => String(html`
      <li class="lista-item lista-item--bloco">
        <div class="lista-item-linha">
          <span class="lista-item-textos">
            <strong>${i.categoria}</strong>
            <span>${formatarMoeda(i.utilizado)} de ${formatarMoeda(i.orcamento.limite)}</span>
          </span>
          <span class="lista-item-lado">
            <strong>${Math.round(i.fracao * 100)}%</strong>
            <span class="etiqueta ${SITUACOES[i.situacao].classe}">${SITUACOES[i.situacao].texto}</span>
            <button type="button" class="botao-texto" data-acao="remover" data-id="${i.orcamento.id}" data-categoria="${i.categoria}">Remover</button>
          </span>
        </div>
        ${barraProgresso(i.fracao, `Uso do limite de ${i.categoria}`)}
      </li>`)).join('');
    this.$('[data-vazio]').hidden = itens.length > 0;
  }

  limparFormulario() {
    this.$('[data-form="limite"]').reset();
  }

  confirmar(mensagem) {
    return window.confirm(mensagem);
  }

  aoMudarPeriodo(handler) {
    ligarSeletorMes(this, handler);
  }

  aoDefinir(handler) {
    this.aoEnviar('[data-form="limite"]', handler);
  }

  aoRemover(handler) {
    this.on('click', '[data-acao="remover"]', (_e, botao) => handler(botao.dataset.id, botao.dataset.categoria));
  }
}
