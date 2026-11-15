import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';
import { formatarDataHora } from '../../utils/data.js';

/** Alertas de orçamento do usuário (UC13), gerados ao cadastrar despesas. */
export class AlertasView extends View {
  template() {
    return html`
      <section class="pagina">
        <header class="pagina-cabecalho">
          <div>
            <h1>Alertas</h1>
            <p class="texto-secundario">Avisos quando uma categoria se aproxima do limite ou o ultrapassa</p>
          </div>
          <button type="button" class="botao botao--secundario" data-acao="marcar-lidos">Marcar todos como lidos</button>
        </header>

        <fieldset class="segmentado segmentado--compacto" aria-label="Mostrar">
          <label><input type="radio" name="filtro" value="todos" checked><span>Todos</span></label>
          <label><input type="radio" name="filtro" value="nao-lidos"><span data-rotulo-nao-lidos>Não lidos</span></label>
        </fieldset>

        <ul class="lista" data-lista></ul>
        <p class="cartao cartao--vazio texto-secundario" data-vazio hidden>Nenhum alerta por aqui.</p>
        <p class="legenda">Os alertas são gerados automaticamente ao cadastrar despesas, a partir de 80% do limite da categoria.</p>
      </section>`;
  }

  /** @param {import('../../models/Notificacao.js').Notificacao[]} alertas */
  mostrarAlertas(alertas, quantidadeNaoLidos) {
    this.$('[data-lista]').innerHTML = alertas.map((n) => String(html`
      <li class="lista-item ${n.lida ? 'alerta--lido' : ''}">
        <span class="lista-item-principal">
          <span class="alerta-icone" aria-hidden="true">!</span>
          <span class="lista-item-textos">
            <strong>${n.mensagem}</strong>
            <span>${formatarDataHora(n.dataEmMs)}${n.lida ? '' : ' · não lido'}</span>
          </span>
        </span>
      </li>`)).join('');
    this.$('[data-vazio]').hidden = alertas.length > 0;
    this.$('[data-rotulo-nao-lidos]').textContent = `Não lidos (${quantidadeNaoLidos})`;
    this.$('[data-acao="marcar-lidos"]').disabled = quantidadeNaoLidos === 0;
  }

  aoFiltrar(handler) {
    this.on('change', '[name="filtro"]', (_e, campo) => handler(campo.value === 'nao-lidos'));
  }

  aoMarcarLidos(handler) {
    this.on('click', '[data-acao="marcar-lidos"]', handler);
  }
}
