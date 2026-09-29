// Trechos de formulário reutilizados pelas telas, com marcação de obrigatório (RNF012).
import { html, seguro } from '../../utils/html.js';

export function rotulo(texto, obrigatorio) {
  return html`${texto}${obrigatorio ? html` <span class="obrigatorio" aria-hidden="true">*</span>` : ''}`;
}

/** Campo de texto, número ou data. `atributos` é HTML fixo do código (não use com dados do usuário). */
export function campo({ nome, texto, tipo = 'text', valor = '', obrigatorio = false, atributos = '' }) {
  return html`
    <div class="campo">
      <label for="${nome}">${rotulo(texto, obrigatorio)}</label>
      <input id="${nome}" name="${nome}" type="${tipo}" value="${valor}" ${obrigatorio ? 'required' : ''} ${seguro(atributos)}>
    </div>`;
}

/** Campo de valor em reais, digitado como "1.234,56". */
export function campoMoeda({ nome, texto, valor = '', obrigatorio = false }) {
  return html`
    <div class="campo">
      <label for="${nome}">${rotulo(texto, obrigatorio)}</label>
      <div class="campo-moeda">
        <span aria-hidden="true">R$</span>
        <input id="${nome}" name="${nome}" inputmode="decimal" autocomplete="off" placeholder="0,00"
          value="${valor}" ${obrigatorio ? 'required' : ''}>
      </div>
    </div>`;
}

/** @param {{ valor: string, texto: string }[]} opcoes */
export function selecao({ nome, texto, opcoes, selecionado = '', obrigatorio = false, vazio = 'Selecione' }) {
  return html`
    <div class="campo">
      <label for="${nome}">${rotulo(texto, obrigatorio)}</label>
      <select id="${nome}" name="${nome}" ${obrigatorio ? 'required' : ''}>
        <option value="">${vazio}</option>
        ${opcoes.map((o) => html`<option value="${o.valor}" ${o.valor === selecionado ? 'selected' : ''}>${o.texto}</option>`)}
      </select>
    </div>`;
}

export function legendaObrigatorios() {
  return html`<p class="legenda"><span class="obrigatorio">*</span> Campos obrigatórios</p>`;
}
