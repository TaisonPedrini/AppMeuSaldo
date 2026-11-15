import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';
import { formatarMoeda } from '../../utils/moeda.js';
import { formatarData } from '../../utils/data.js';
import { campo, campoMoeda, legendaObrigatorios } from '../components/campos.js';
import { valorComSinal } from '../components/indicadores.js';
import { iniciais } from '../../utils/texto.js';

/** Saldo devedor do terceiro, formulário de reembolso e histórico de pagamentos (UC11). */
export class ReembolsoView extends View {
  template({ terceiro, hoje }) {
    return html`
      <section class="pagina">
        <a class="voltar" href="#/terceiros">← Terceiros</a>
        <header class="pagina-cabecalho">
          <div class="lista-item-principal">
            <span class="avatar avatar--terceiro" aria-hidden="true">${iniciais(terceiro.nome)}</span>
            <div>
              <h1>${terceiro.nome}</h1>
              <p class="texto-secundario">Registrar reembolso</p>
            </div>
          </div>
        </header>

        <div class="pagina-dupla">
          <div class="pagina">
            <div class="cartao indicador">
              <span class="indicador-rotulo">Saldo devedor</span>
              <span class="indicador-valor" data-saldo></span>
            </div>

            <div>
              <h2>Pagamentos recebidos</h2>
              <ul class="lista" data-lista></ul>
              <p class="cartao cartao--vazio texto-secundario" data-vazio hidden>Nenhum pagamento registrado ainda.</p>
              <button type="button" class="botao botao--secundario" data-acao="mais" hidden>Carregar mais</button>
            </div>
          </div>

          <form class="cartao formulario" data-form="reembolso" novalidate>
            <h2>Novo reembolso</h2>
            ${campoMoeda({ nome: 'valor', texto: 'Valor recebido', obrigatorio: true })}
            ${campo({ nome: 'data', texto: 'Data', tipo: 'date', valor: hoje, obrigatorio: true })}
            ${legendaObrigatorios()}
            <button type="submit" class="botao botao--primario botao--bloco">Confirmar reembolso</button>
          </form>
        </div>
      </section>`;
  }

  render(dados) {
    super.render(dados);
    this.hoje = dados.hoje;
    this.atualizarSaldo(dados.terceiro.saldoDevedor);
    return this;
  }

  atualizarSaldo(saldoDevedor) {
    const saldo = this.$('[data-saldo]');
    saldo.textContent = formatarMoeda(saldoDevedor);
    saldo.className = `indicador-valor ${saldoDevedor > 0 ? 'valor-negativo' : 'valor-positivo'}`;
  }

  mostrarReembolsos(reembolsos, { haMais, substituir = false }) {
    const lista = this.$('[data-lista]');
    const markup = reembolsos.map((r) => String(html`
      <li class="lista-item">
        <span class="lista-item-textos"><strong>Pagamento</strong><span>${formatarData(r.data)}</span></span>
        ${valorComSinal(r.valor, true)}
      </li>`)).join('');
    if (substituir) lista.innerHTML = markup;
    else lista.insertAdjacentHTML('beforeend', markup);

    this.$('[data-vazio]').hidden = lista.children.length > 0;
    this.$('[data-acao="mais"]').hidden = !haMais;
  }

  limparFormulario() {
    const form = this.$('[data-form="reembolso"]');
    form.reset();
    form.data.value = this.hoje;
  }

  aoRegistrar(handler) {
    this.aoEnviar('[data-form="reembolso"]', handler);
  }

  aoCarregarMais(handler) {
    this.on('click', '[data-acao="mais"]', handler);
  }
}
