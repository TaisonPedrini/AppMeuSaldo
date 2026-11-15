// Trechos visuais de acompanhamento: barra de progresso e valores com sinal.
import { html, seguro } from '../../utils/html.js';
import { formatarMoeda } from '../../utils/moeda.js';

/**
 * Barra de progresso acessível. A cor muda perto do limite (≥ 80%) e acima dele (≥ 100%),
 * como nos alertas de orçamento (RF018).
 * @param {number} fracao 0 a 1 (valores acima de 1 enchem a barra)
 */
export function barraProgresso(fracao, rotulo) {
  const seguroFracao = Number.isFinite(fracao) ? Math.max(fracao, 0) : 0;
  const percentual = Math.round(seguroFracao * 100);
  const estado = seguroFracao >= 1 ? 'progresso--perigo' : seguroFracao >= 0.8 ? 'progresso--alerta' : '';
  return html`
    <div class="progresso ${estado}" role="progressbar" aria-label="${rotulo}"
      aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(percentual, 100)}">
      <span style="${seguro(`width: ${Math.min(percentual, 100)}%`)}"></span>
    </div>`;
}

/** "- R$ 10,00" em vermelho ou "+ R$ 10,00" em verde. */
export function valorComSinal(centavos, positivo) {
  return html`<span class="${positivo ? 'valor-positivo' : 'valor-negativo'}">${positivo ? '+' : '-'} ${formatarMoeda(Math.abs(centavos))}</span>`;
}
