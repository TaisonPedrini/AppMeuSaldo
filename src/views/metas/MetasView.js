import { View } from '../../core/View.js';
import { html } from '../../utils/html.js';
import { formatarMoeda } from '../../utils/moeda.js';
import { formatarData } from '../../utils/data.js';
import { campo, campoMoeda, legendaObrigatorios } from '../components/campos.js';

/** Metas de economia com o progresso de cada uma (UC14, RF015). */
export class MetasView extends View {
  template() {
    return html`
      <section class="pagina">
        <header class="pagina-cabecalho">
          <div>
            <h1>Metas de economia</h1>
            <p class="texto-secundario">Quanto você já guardou para cada objetivo</p>
          </div>
        </header>

        <div class="indicadores">
          <div class="cartao indicador">
            <span class="indicador-rotulo">Total guardado</span>
            <span class="indicador-valor valor-positivo" data-guardado>—</span>
            <span class="legenda" data-ativas></span>
          </div>
          <div class="cartao indicador">
            <span class="indicador-rotulo">Valor alvo total</span>
            <span class="indicador-valor" data-alvo>—</span>
          </div>
          <div class="cartao indicador">
            <span class="indicador-rotulo">Progresso geral</span>
            <span class="indicador-valor" data-progresso>—</span>
          </div>
        </div>

        <div class="pagina-dupla">
          <div>
            <ul class="metas-grade" data-lista></ul>
            <p class="cartao cartao--vazio texto-secundario" data-vazio hidden>
              Nenhuma meta criada. Crie uma meta, como uma viagem ou a reserva de emergência, e acompanhe quanto já guardou.
            </p>
          </div>

          <form class="cartao formulario" data-form="meta" novalidate>
            <h2>Nova meta</h2>
            ${campo({ nome: 'nome', texto: 'Nome', obrigatorio: true, atributos: 'placeholder="Ex.: Viagem de férias"' })}
            ${campoMoeda({ nome: 'valorAlvo', texto: 'Valor alvo', obrigatorio: true })}
            ${campo({ nome: 'prazo', texto: 'Prazo', tipo: 'date', obrigatorio: true })}
            ${legendaObrigatorios()}
            <button type="submit" class="botao botao--primario botao--bloco">Criar meta</button>
          </form>
        </div>
      </section>`;
  }

  /** @param {import('../../models/Meta.js').Meta[]} metas */
  mostrarMetas(metas) {
    this.$('[data-lista]').innerHTML = metas.map((m) => {
      const percentual = Math.round(m.progresso * 100);
      return String(html`
        <li class="cartao meta">
          <div class="lista-item-linha">
            <strong class="meta-nome">${m.nome}</strong>
            <strong class="${percentual >= 100 ? 'valor-positivo' : ''}">${percentual}%</strong>
          </div>
          <div class="progresso" role="progressbar" aria-label="Progresso da meta ${m.nome}"
            aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percentual}">
            <span style="width: ${percentual}%"></span>
          </div>
          <p class="texto-secundario">${formatarMoeda(m.valorAtual)} de ${formatarMoeda(m.valorAlvo)}</p>
          <p class="legenda">Prazo ${formatarData(m.prazo)}</p>
          <form class="meta-adicionar" data-form="adicionar" data-id="${m.id}" novalidate>
            <div class="campo">
              <label for="valor-${m.id}">Adicionar valor à meta</label>
              <div class="campo-moeda">
                <span aria-hidden="true">R$</span>
                <input id="valor-${m.id}" name="valor-${m.id}" inputmode="decimal" autocomplete="off" placeholder="0,00">
              </div>
            </div>
            <button type="submit" class="botao botao--secundario">Adicionar</button>
          </form>
          <button type="button" class="botao-texto meta-excluir" data-acao="excluir" data-id="${m.id}" data-nome="${m.nome}">Excluir meta</button>
        </li>`);
    }).join('');

    const guardado = metas.reduce((soma, m) => soma + m.valorAtual, 0);
    const alvo = metas.reduce((soma, m) => soma + m.valorAlvo, 0);
    this.$('[data-guardado]').textContent = formatarMoeda(guardado);
    this.$('[data-ativas]').textContent = `${metas.length} ${metas.length === 1 ? 'meta' : 'metas'}`;
    this.$('[data-alvo]').textContent = formatarMoeda(alvo);
    this.$('[data-progresso]').textContent = `${alvo ? Math.round((guardado / alvo) * 100) : 0}%`;
    this.$('[data-vazio]').hidden = metas.length > 0;
  }

  limparFormulario() {
    this.$('[data-form="meta"]').reset();
  }

  confirmar(mensagem) {
    return window.confirm(mensagem);
  }

  aoCriar(handler) {
    this.aoEnviar('[data-form="meta"]', handler);
  }

  aoAdicionarValor(handler) {
    this.on('submit', '[data-form="adicionar"]', (e, form) => {
      e.preventDefault();
      const id = form.dataset.id;
      handler(id, form.elements[`valor-${id}`].value, form);
    });
  }

  aoExcluir(handler) {
    this.on('click', '[data-acao="excluir"]', (_e, botao) => handler(botao.dataset.id, botao.dataset.nome));
  }
}
