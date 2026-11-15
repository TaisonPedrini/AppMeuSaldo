import { View } from '../../core/View.js';
import { html, seguro } from '../../utils/html.js';
import { formatarMoeda } from '../../utils/moeda.js';
import { iniciais } from '../../utils/texto.js';
import { BANCOS, OUTRO_BANCO, bancoPorId } from '../../models/bancos.js';
import { campo, campoMoeda, rotulo, legendaObrigatorios } from '../components/campos.js';
import { barraProgresso } from '../components/indicadores.js';

/** Selo do banco: a sigla na cor da marca. Cartões sem banco da lista usam as iniciais em cinza. */
function seloBanco(banco, nomeAlternativo = '') {
  const cores = banco ? `background: ${banco.fundo}; color: ${banco.texto}` : '';
  return html`<span class="banco-selo" style="${seguro(cores)}" aria-hidden="true">${banco ? banco.sigla : iniciais(nomeAlternativo)}</span>`;
}

/** Cartões de crédito do grupo com o uso do limite no mês e formulário de inclusão (UC06). */
export class CartoesView extends View {
  constructor(raiz) {
    super(raiz);
    this.on('change', '[name="banco"]', () => this.atualizarOutro());
  }

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
            ${campo({ nome: 'nome', texto: 'Nome do cartão', obrigatorio: true, atributos: 'placeholder="Ex.: Cartão do casal"' })}

            <fieldset class="campo">
              <legend>${rotulo('Banco', true)}</legend>
              <div class="bancos-grade">
                ${BANCOS.map((banco) => html`
                  <label class="banco-opcao">
                    <input type="radio" name="banco" value="${banco.id}">
                    ${seloBanco(banco)}
                    <span class="banco-nome">${banco.nome}</span>
                  </label>`)}
                <label class="banco-opcao">
                  <input type="radio" name="banco" value="${OUTRO_BANCO}">
                  <span class="banco-selo banco-selo--outro" aria-hidden="true">+</span>
                  <span class="banco-nome">Outro</span>
                </label>
              </div>
            </fieldset>

            <div data-secao="outro-banco" hidden>
              ${campo({ nome: 'bandeira', texto: 'Nome do banco', obrigatorio: true, atributos: 'placeholder="Ex.: Banrisul"' })}
            </div>

            ${campoMoeda({ nome: 'limite', texto: 'Limite', obrigatorio: true })}
            ${legendaObrigatorios()}
            <button type="submit" class="botao botao--primario botao--bloco">Adicionar cartão</button>
          </form>
        </div>
      </section>`;
  }

  /** O campo "Nome do banco" só aparece quando a opção é "Outro". */
  atualizarOutro() {
    const escolhido = this.$('[name="banco"]:checked')?.value;
    this.$('[data-secao="outro-banco"]').hidden = escolhido !== OUTRO_BANCO;
  }

  /** @param {{ cartao: import('../../models/Cartao.js').Cartao, gastoNoMes: number }[]} itens */
  mostrarCartoes(itens) {
    this.$('[data-lista]').innerHTML = itens.map(({ cartao, gastoNoMes }) => {
      const banco = bancoPorId(cartao.banco);
      return String(html`
      <li class="cartao cartao-credito" style="${seguro(`border-top-color: ${banco ? banco.fundo : 'var(--cor-borda)'}`)}">
        <div class="cartao-credito-topo">
          <div class="lista-item-principal">
            ${seloBanco(banco, cartao.bandeira)}
            <div class="lista-item-textos">
              <strong>${cartao.nome}</strong>
              <span>${cartao.bandeira}</span>
            </div>
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
      </li>`);
    }).join('');
    this.$('[data-vazio]').hidden = itens.length > 0;
  }

  limparFormulario() {
    this.$('[data-form="cartao"]').reset();
    this.atualizarOutro();
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
