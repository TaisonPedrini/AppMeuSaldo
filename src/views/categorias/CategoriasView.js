import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';
import { campo, selecao, legendaObrigatorios } from '../components/campos.js';
import { Rotulos, TipoCategoria } from '../../models/enums.js';

const OPCOES_TIPO = Object.values(TipoCategoria).map((valor) => ({ valor, texto: Rotulos[valor] }));

/** Lista paginada de categorias com formulário de inclusão (UC07). */
export class CategoriasView extends View {
  template() {
    return html`
      <section class="pagina">
        <h1>Categorias</h1>

        <form class="cartao formulario" data-form="categoria" novalidate>
          <h2>Nova categoria</h2>
          ${campo({ nome: 'nome', texto: 'Nome', obrigatorio: true })}
          ${selecao({ nome: 'tipo', texto: 'Tipo', opcoes: OPCOES_TIPO, selecionado: TipoCategoria.DESPESA, obrigatorio: true })}
          ${legendaObrigatorios()}
          <button type="submit" class="botao botao--primario">Adicionar</button>
        </form>

        <ul class="lista" data-lista></ul>
        <p class="texto-secundario" data-vazio hidden>Nenhuma categoria cadastrada.</p>
        <button type="button" class="botao botao--secundario" data-acao="mais" hidden>Carregar mais</button>
      </section>`;
  }

  /** Acrescenta itens à lista; `substituir` limpa a lista antes. */
  mostrarCategorias(categorias, { haMais, substituir = false }) {
    const lista = this.$('[data-lista]');
    const itens = categorias.map((c) => html`
      <li class="lista-item">
        <span>${c.nome}</span>
        <span class="etiqueta etiqueta--${c.tipo.toLowerCase()}">${Rotulos[c.tipo]}</span>
      </li>`);
    const markup = itens.map(String).join('');
    if (substituir) lista.innerHTML = markup;
    else lista.insertAdjacentHTML('beforeend', markup);

    this.$('[data-vazio]').hidden = lista.children.length > 0;
    this.$('[data-acao="mais"]').hidden = !haMais;
  }

  limparFormulario() {
    this.$('[data-form="categoria"]').reset();
  }

  aoAdicionar(handler) {
    this.aoEnviar('[data-form="categoria"]', handler);
  }

  aoCarregarMais(handler) {
    this.on('click', '[data-acao="mais"]', handler);
  }
}
