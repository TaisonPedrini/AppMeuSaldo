import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';
import { formatarMoeda } from '../../utils/moeda.js';
import { formatarData } from '../../utils/data.js';
import { FormaPagamento, Rotulos, TipoCategoria } from '../../models/enums.js';
import { valorComSinal } from '../components/indicadores.js';
import { ligarSeletorMes, seletorMes } from '../components/seletorMes.js';

const opcao = (valor, texto) => html`<option value="${valor}">${texto}</option>`;

/** Histórico de movimentações com filtros (RF022) e páginas de até 20 itens (RNF004). */
export class LancamentosView extends View {
  template({ periodo, categorias, usuario }) {
    return html`
      <section class="pagina">
        <header class="pagina-cabecalho">
          <div>
            <h1>Lançamentos</h1>
            <p class="texto-secundario">Histórico de movimentações</p>
          </div>
          <div class="pagina-acoes">
            <a class="botao botao--secundario" href="#/receitas/nova">+ Nova receita</a>
            <a class="botao botao--primario" href="#/despesas/nova">+ Nova despesa</a>
          </div>
        </header>

        <form class="cartao filtros" data-form="filtros" role="search" aria-label="Filtros de lançamentos">
          <div class="campo filtros-busca">
            <label for="busca">Buscar</label>
            <input id="busca" name="busca" type="search" placeholder="Buscar por descrição" autocomplete="off">
          </div>
          <div class="campo filtros-mes">
            <span class="campo-rotulo">Mês</span>
            ${seletorMes(periodo)}
          </div>
          <div class="campo">
            <label for="usuarioId">Pessoa</label>
            <select id="usuarioId" name="usuarioId">
              ${opcao('', 'Todos')}
              ${opcao(usuario.id, usuario.nome.split(' ')[0])}
            </select>
          </div>
          <div class="campo">
            <label for="categoriaId">Categoria</label>
            <select id="categoriaId" name="categoriaId">
              ${opcao('', 'Todas')}
              ${categorias.map((c) => opcao(c.id, c.nome))}
            </select>
          </div>
          <div class="campo">
            <label for="tipo">Tipo</label>
            <select id="tipo" name="tipo">
              ${opcao('', 'Todos')}
              ${Object.values(TipoCategoria).map((t) => opcao(t, Rotulos[t]))}
            </select>
          </div>
          <div class="campo">
            <label for="formaPagamento">Pagamento</label>
            <select id="formaPagamento" name="formaPagamento">
              ${opcao('', 'Todos')}
              ${Object.values(FormaPagamento).map((f) => opcao(f, Rotulos[f]))}
            </select>
          </div>
          <button type="reset" class="botao-texto filtros-limpar">Limpar filtros</button>
        </form>

        <p class="texto-secundario" data-resumo aria-live="polite"></p>

        <ul class="lista" data-lista></ul>
        <p class="cartao cartao--vazio texto-secundario" data-vazio hidden>Nenhum lançamento encontrado para estes filtros.</p>

        <nav class="paginacao" aria-label="Páginas" data-paginacao hidden>
          <button type="button" class="botao-texto" data-pagina="anterior">‹ Anterior</button>
          <span class="texto-secundario" data-pagina-atual></span>
          <button type="button" class="botao-texto" data-pagina="proxima">Próxima ›</button>
        </nav>
      </section>`;
  }

  carregando(ativo) {
    this.$('[data-lista]').setAttribute('aria-busy', String(ativo));
    if (ativo) this.$('[data-resumo]').textContent = 'Carregando…';
  }

  /** @param {{ itens: object[], pagina: number, totalPaginas: number, totais: object, quantidade: number }} dados */
  mostrarLancamentos({ itens, pagina, totalPaginas, totais, quantidade }) {
    this.pagina = pagina;
    this.$('[data-lista]').innerHTML = itens.map((l) => {
      const receita = l.tipo === TipoCategoria.RECEITA;
      const forma = l.cartao ?? (l.formaPagamento ? Rotulos[l.formaPagamento] : null);
      const detalhes = [formatarData(l.data), l.categoria, l.pessoa, forma].filter(Boolean).join(' · ');
      return String(html`
        <li class="lista-item">
          <span class="lista-item-textos">
            <strong>${l.descricao}</strong>
            <span>${detalhes}</span>
          </span>
          <span class="lista-item-lado">${valorComSinal(l.valor, receita)}</span>
        </li>`);
    }).join('');

    this.$('[data-vazio]').hidden = itens.length > 0;
    this.$('[data-resumo]').textContent = quantidade
      ? `${quantidade} ${quantidade === 1 ? 'lançamento' : 'lançamentos'} · Receitas ${formatarMoeda(totais.receitas)} · Despesas ${formatarMoeda(totais.despesas)}`
      : '';

    this.$('[data-paginacao]').hidden = totalPaginas <= 1;
    this.$('[data-pagina-atual]').textContent = `Página ${pagina} de ${totalPaginas} · 20 por página`;
    this.$('[data-pagina="anterior"]').disabled = pagina <= 1;
    this.$('[data-pagina="proxima"]').disabled = pagina >= totalPaginas;
  }

  aoFiltrar(handler) {
    const form = () => this.$('[data-form="filtros"]');
    const enviar = () => handler(Object.fromEntries(new FormData(form())));
    let espera;
    this.on('change', '[data-form="filtros"]', enviar);
    this.on('input', '#busca', () => {
      clearTimeout(espera);
      espera = setTimeout(enviar, 250);
    });
    this.on('submit', '[data-form="filtros"]', (e) => e.preventDefault());
    // O reset limpa os filtros; o mês fica num campo oculto, que o reset não altera.
    // O evento dispara antes da limpeza, por isso a leitura vai para o próximo ciclo.
    this.on('reset', '[data-form="filtros"]', () => setTimeout(enviar));
    ligarSeletorMes(this, enviar);
  }

  aoPaginar(handler) {
    this.on('click', '[data-pagina]', (_e, botao) => {
      handler(this.pagina + (botao.dataset.pagina === 'proxima' ? 1 : -1));
      this.$('[data-lista]').scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }
}
