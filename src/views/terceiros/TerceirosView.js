import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';
import { formatarMoeda } from '../../utils/moeda.js';
import { iniciais } from '../../utils/texto.js';
import { campo, legendaObrigatorios } from '../components/campos.js';

/** Pessoas de fora do grupo que usam o cartão do casal, com o saldo devedor de cada uma (UC03). */
export class TerceirosView extends View {
  template() {
    return html`
      <section class="pagina">
        <header class="pagina-cabecalho">
          <div>
            <h1>Terceiros</h1>
            <p class="texto-secundario">Pessoas que usam o cartão do casal</p>
          </div>
        </header>

        <div class="indicadores">
          <div class="cartao indicador">
            <span class="indicador-rotulo">Total a receber</span>
            <span class="indicador-valor valor-negativo" data-total>—</span>
          </div>
          <div class="cartao indicador">
            <span class="indicador-rotulo">Devendo</span>
            <span class="indicador-valor" data-devendo>—</span>
          </div>
          <div class="cartao indicador">
            <span class="indicador-rotulo">Quitados</span>
            <span class="indicador-valor valor-positivo" data-quitados>—</span>
          </div>
        </div>

        <div class="pagina-dupla">
          <div>
            <ul class="lista" data-lista></ul>
            <p class="cartao cartao--vazio texto-secundario" data-vazio hidden>
              Nenhum terceiro cadastrado. Cadastre quem pega o cartão emprestado para controlar o que essa pessoa deve.
            </p>
          </div>

          <form class="cartao formulario" data-form="terceiro" novalidate>
            <h2>Novo terceiro</h2>
            ${campo({ nome: 'nome', texto: 'Nome', obrigatorio: true, atributos: 'placeholder="Ex.: Dona Sônia" autocomplete="off"' })}
            ${legendaObrigatorios()}
            <button type="submit" class="botao botao--primario botao--bloco">Adicionar terceiro</button>
          </form>
        </div>
      </section>`;
  }

  /** @param {import('../../models/Terceiro.js').Terceiro[]} terceiros */
  mostrarTerceiros(terceiros) {
    this.$('[data-lista]').innerHTML = terceiros.map((t) => String(html`
      <li>
        <a class="lista-item" href="#/terceiros/${encodeURIComponent(t.id)}/reembolso" aria-label="${t.nome}: ver saldo e registrar reembolso">
          <span class="lista-item-principal">
            <span class="avatar avatar--terceiro" aria-hidden="true">${iniciais(t.nome)}</span>
            <span class="lista-item-textos"><strong>${t.nome}</strong><span>Registrar reembolso</span></span>
          </span>
          <span class="lista-item-lado">
            <strong class="${t.saldoDevedor > 0 ? 'valor-negativo' : 'valor-positivo'}">${formatarMoeda(t.saldoDevedor)}</strong>
            ${t.saldoDevedor > 0
              ? html`<span class="etiqueta etiqueta--devendo">Devendo</span>`
              : html`<span class="etiqueta etiqueta--quitado">Quitado</span>`}
          </span>
        </a>
      </li>`)).join('');

    const devendo = terceiros.filter((t) => t.saldoDevedor > 0);
    this.$('[data-total]').textContent = formatarMoeda(devendo.reduce((soma, t) => soma + t.saldoDevedor, 0));
    this.$('[data-devendo]').textContent = String(devendo.length);
    this.$('[data-quitados]').textContent = String(terceiros.length - devendo.length);
    this.$('[data-vazio]').hidden = terceiros.length > 0;
  }

  limparFormulario() {
    this.$('[data-form="terceiro"]').reset();
  }

  aoAdicionar(handler) {
    this.aoEnviar('[data-form="terceiro"]', handler);
  }
}
