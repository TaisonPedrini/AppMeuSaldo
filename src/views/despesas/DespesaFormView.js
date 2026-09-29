import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';
import { centavosParaCampo } from '../../utils/moeda.js';
import { campo, campoMoeda, selecao, rotulo, legendaObrigatorios } from '../components/campos.js';
import { Classificacao, FormaPagamento, Periodicidade, Rotulos } from '../../models/enums.js';

const opcoesDe = (valores) => valores.map((valor) => ({ valor, texto: Rotulos[valor] }));

/** Cadastrar despesa (UC05), com divisão (UC08), leitura de cupom (UC09) e recorrência (UC10). */
export class DespesaFormView extends View {
  constructor(raiz) {
    super(raiz);
    this.on('change', 'select, input', () => this.atualizarSecoes());
  }

  template({ categorias = [], cartoes = [], terceiros = [], hoje = '' }) {
    return html`
      <section class="pagina">
        <h1>Nova despesa</h1>

        <button type="button" class="botao botao--secundario botao--bloco" data-acao="ler-cupom">Ler cupom fiscal</button>

        <form class="cartao formulario" data-form="despesa" novalidate>
          ${campoMoeda({ nome: 'valor', texto: 'Valor', obrigatorio: true })}
          ${campo({ nome: 'data', texto: 'Data', tipo: 'date', valor: hoje, obrigatorio: true })}
          ${campo({ nome: 'descricao', texto: 'Descrição', obrigatorio: true })}
          ${selecao({ nome: 'categoriaId', texto: 'Categoria', obrigatorio: true,
            opcoes: categorias.map((c) => ({ valor: c.id, texto: c.nome })) })}
          ${selecao({ nome: 'formaPagamento', texto: 'Forma de pagamento', obrigatorio: true,
            opcoes: opcoesDe(Object.values(FormaPagamento)) })}

          <div data-secao="cartao" hidden>
            ${selecao({ nome: 'cartaoId', texto: 'Cartão', obrigatorio: true,
              opcoes: cartoes.map((c) => ({ valor: c.id, texto: `${c.nome} (${c.bandeira})` })) })}
          </div>

          <fieldset class="campo">
            <legend>${rotulo('Classificação', true)}</legend>
            <div class="segmentado">
              ${Object.values(Classificacao).map((valor) => html`
                <label>
                  <input type="radio" name="classificacao" value="${valor}" ${valor === Classificacao.PESSOAL ? 'checked' : ''}>
                  <span>${Rotulos[valor]}</span>
                </label>`)}
            </div>
          </fieldset>

          <div data-secao="terceiro" hidden>
            ${selecao({ nome: 'divisao.terceiroId', texto: 'Terceiro', obrigatorio: true,
              opcoes: terceiros.map((t) => ({ valor: t.id, texto: t.nome })) })}
            ${campoMoeda({ nome: 'divisao.valor', texto: 'Parte do terceiro (vazio = valor total)' })}
          </div>

          <label class="campo campo--checkbox">
            <input type="checkbox" name="recorrente">
            <span>Despesa recorrente</span>
          </label>

          <div data-secao="recorrencia" hidden>
            ${selecao({ nome: 'periodicidade', texto: 'Periodicidade', obrigatorio: true,
              opcoes: opcoesDe(Object.values(Periodicidade)) })}
            ${campo({ nome: 'dataFim', texto: 'Data final', tipo: 'date' })}
          </div>

          <label class="campo campo--checkbox">
            <input type="checkbox" name="abateIR">
            <span>Dedutível no Imposto de Renda</span>
          </label>

          ${legendaObrigatorios()}
          <button type="submit" class="botao botao--primario botao--bloco">Salvar despesa</button>
        </form>
      </section>`;
  }

  render(dados) {
    super.render(dados);
    this.atualizarSecoes();
    return this;
  }

  /** Mostra só os campos que se aplicam à forma de pagamento, classificação e recorrência escolhidas. */
  atualizarSecoes() {
    const form = this.$('[data-form="despesa"]');
    if (!form) return;
    this.$('[data-secao="cartao"]').hidden = form.formaPagamento.value !== FormaPagamento.CREDITO;
    this.$('[data-secao="terceiro"]').hidden = form.classificacao.value !== Classificacao.TERCEIRO;
    this.$('[data-secao="recorrencia"]').hidden = !form.recorrente.checked;
  }

  /** Preenche o formulário com dados vindos da leitura do cupom (valor em centavos). */
  preencher({ valor, data, descricao }) {
    const form = this.$('[data-form="despesa"]');
    if (valor != null) form.valor.value = centavosParaCampo(valor);
    if (data) form.data.value = data;
    if (descricao) form.descricao.value = descricao;
  }

  aoSalvar(handler) {
    this.aoEnviar('[data-form="despesa"]', handler);
  }

  aoLerCupom(handler) {
    this.on('click', '[data-acao="ler-cupom"]', handler);
  }
}
