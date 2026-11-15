import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';
import { formatarMoeda } from '../../utils/moeda.js';
import { campo, campoMoeda, legendaObrigatorios } from '../components/campos.js';
import { barraProgresso } from '../components/indicadores.js';

/** Cartões de crédito do grupo com o uso do limite no mês e formulário de inclusão (UC06). */
export class CartoesView extends View {
  template({ mes }) {
    return html`
      <section class="pagina">
        <header class="pagina-cabecalho">
          <div>
            <h1>Cartões de crédito</h1>
            <p class="texto-secundario">Gastos no crédito em ${mes}</p>
          </div>
        </header>

        <div class="pagina-dupla">
          <div>
            <ul class="cartoes-grade" data-lista></ul>
            <p class="cartao cartao--vazio texto-secundario" data-vazio hidden>
              Nenhum cartão cadastrado. Cadastre o cartão do casal para associar as despesas no crédito.
            </p>
          </div>

          <form class="cartao formulario" data-form="cartao" novalidate>
            <h2>Novo cartão</h2>
            ${campo({ nome: 'nome', texto: 'Nome do cartão', obrigatorio: true, atributos: 'placeholder="Ex.: Nubank do casal"' })}
            ${campo({ nome: 'bandeira', texto: 'Banco ou bandeira', obrigatorio: true, atributos: 'placeholder="Ex.: Nubank, Visa"' })}
            ${campoMoeda({ nome: 'limite', texto: 'Limite', obrigatorio: true })}
            ${legendaObrigatorios()}
            <button type="submit" class="botao botao--primario botao--bloco">Adicionar cartão</button>
          </form>
        </div>
      </section>`;
  }

  /** @param {{ cartao: import('../../models/Cartao.js').Cartao, gastoNoMes: number }[]} itens */
  mostrarCartoes(itens) {
    this.$('[data-lista]').innerHTML = itens.map(({ cartao, gastoNoMes }) => String(html`
      <li class="cartao cartao-credito">
        <div class="cartao-credito-topo">
          <div class="lista-item-textos">
            <strong>${cartao.nome}</strong>
            <span>${cartao.bandeira}</span>
          </div>
          <button type="button" class="botao-texto" data-acao="excluir" data-id="${cartao.id}" data-nome="${cartao.nome}">Excluir</button>
        </div>
        <p class="indicador-rotulo">Gasto no mês</p>
        <p class="indicador-valor">${formatarMoeda(gastoNoMes)}</p>
        ${barraProgresso(gastoNoMes / cartao.limite, `Uso do limite do cartão ${cartao.nome}`)}
        <p class="texto-secundario legenda">
          ${Math.round((gastoNoMes / cartao.limite) * 100)}% de ${formatarMoeda(cartao.limite)} ·
          disponível ${formatarMoeda(Math.max(cartao.limite - gastoNoMes, 0))}
        </p>
      </li>`)).join('');
    this.$('[data-vazio]').hidden = itens.length > 0;
  }

  limparFormulario() {
    this.$('[data-form="cartao"]').reset();
  }

  confirmar(mensagem) {
    return window.confirm(mensagem);
  }

  aoAdicionar(handler) {
    this.aoEnviar('[data-form="cartao"]', handler);
  }

  aoExcluir(handler) {
    this.on('click', '[data-acao="excluir"]', (_e, botao) => handler(botao.dataset.id, botao.dataset.nome));
  }
}
