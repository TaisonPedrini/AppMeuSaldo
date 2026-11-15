// Seletor de mês "‹ Novembro de 2026 ›", como no protótipo do Figma.
// Substitui o <input type="month">, que o Firefox e o Safari para Mac não exibem como seletor (RNF008).
import { html, seguro } from '../../utils/html.js';
import { nomeDoMesTitulo, somarMeses } from '../../utils/data.js';

const SETA_ESQUERDA = '<path d="m15 18-6-6 6-6"/>';
const SETA_DIREITA = '<path d="m9 18 6-6-6-6"/>';

function seta(caminho) {
  return seguro(`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${caminho}</svg>`);
}

/** O valor fica num campo oculto `periodo` ("AAAA-MM"), lido junto com os demais campos do formulário. */
export function seletorMes(periodo) {
  return html`
    <div class="seletor-mes" data-seletor-mes role="group" aria-label="Mês">
      <button type="button" class="botao-icone" data-mes-passo="-1" aria-label="Mês anterior">${seta(SETA_ESQUERDA)}</button>
      <span class="seletor-mes-rotulo" data-mes-rotulo aria-live="polite">${nomeDoMesTitulo(periodo)}</span>
      <button type="button" class="botao-icone" data-mes-passo="1" aria-label="Próximo mês">${seta(SETA_DIREITA)}</button>
      <input type="hidden" name="periodo" value="${periodo}">
    </div>`;
}

/**
 * Liga as setas do seletor: atualiza o rótulo e o campo oculto e avisa o novo período.
 * @param {import('../../core/View.js').View} view
 * @param {(periodo: string) => void} aoMudar
 */
export function ligarSeletorMes(view, aoMudar) {
  view.on('click', '[data-mes-passo]', (_e, botao) => {
    const seletor = botao.closest('[data-seletor-mes]');
    const campo = seletor.querySelector('input[name="periodo"]');
    campo.value = somarMeses(campo.value, Number(botao.dataset.mesPasso));
    seletor.querySelector('[data-mes-rotulo]').textContent = nomeDoMesTitulo(campo.value);
    aoMudar(campo.value);
  });
}
