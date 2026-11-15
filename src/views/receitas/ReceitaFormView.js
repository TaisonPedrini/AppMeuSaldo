import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';
import { campo, campoMoeda, selecao, legendaObrigatorios } from '../components/campos.js';

/** Cadastrar receita (UC04): valor, data, descrição e categoria. Quem recebeu é o usuário logado (RF005). */
export class ReceitaFormView extends View {
  template({ categorias = [], hoje = '' }) {
    return html`
      <section class="pagina">
        <a class="voltar" href="#/">← Início</a>
        <header class="pagina-cabecalho">
          <h1>Nova receita</h1>
        </header>

        ${categorias.length === 0 ? html`
          <p class="cartao texto-secundario">
            Nenhuma categoria de receita cadastrada.
            <a href="#/categorias">Cadastre uma categoria</a> do tipo Receita (ex.: Salário) para continuar.
          </p>` : ''}

        <form class="cartao formulario formulario--largo" data-form="receita" novalidate>
          <div class="grade-2">
            ${campoMoeda({ nome: 'valor', texto: 'Valor', obrigatorio: true })}
            ${campo({ nome: 'data', texto: 'Data', tipo: 'date', valor: hoje, obrigatorio: true })}
          </div>
          <div class="grade-2">
            ${campo({ nome: 'descricao', texto: 'Descrição', obrigatorio: true, atributos: 'placeholder="Ex.: Salário"' })}
            ${selecao({ nome: 'categoriaId', texto: 'Categoria', obrigatorio: true,
              opcoes: categorias.map((c) => ({ valor: c.id, texto: c.nome })) })}
          </div>
          ${legendaObrigatorios()}
          <button type="submit" class="botao botao--primario botao--bloco">Salvar receita</button>
        </form>
      </section>`;
  }

  aoSalvar(handler) {
    this.aoEnviar('[data-form="receita"]', handler);
  }
}
