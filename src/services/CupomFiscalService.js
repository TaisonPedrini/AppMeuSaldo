// Leitura de cupom fiscal por QR Code (RF011 / UC09).
// 1. Interpreta o QR Code (chave de acesso, endereço da SEFAZ e, quando vierem, valor e data).
// 2. Consulta a nota na SEFAZ pela Cloud Function `consultarCupom` (CUPOM_CONSULTA_URL) para obter
//    emitente, valor e data, que na emissão normal da NFC-e não vêm no QR Code.
// Se a consulta falhar, devolve o que o QR Code trouxe com `completo: false`, e o formulário segue
// no preenchimento manual (RNF013).
import { CUPOM_CONSULTA_URL } from '../config/app.config.js';
import { ErroServicoIndisponivel } from '../core/erros.js';
import { interpretarQrCodeCupom } from '../utils/nfce.js';
import { nomeDeEmpresa } from '../utils/texto.js';
import { dataISOValida } from '../utils/data.js';

const TEMPO_LIMITE_MS = 10000; // portais da SEFAZ às vezes demoram

/** Pergunta à Cloud Function os dados da nota. Retorna null se o serviço não respondeu direito. */
async function consultarSefaz(textoQr) {
  if (!CUPOM_CONSULTA_URL) return null;
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    const resposta = await fetch(`${CUPOM_CONSULTA_URL}?qr=${encodeURIComponent(textoQr)}`, { signal: controle.signal });
    if (!resposta.ok) return null;
    const dados = await resposta.json();
    return {
      emitente: typeof dados.emitente === 'string' ? dados.emitente : null,
      valor: Number.isInteger(dados.valor) && dados.valor > 0 ? dados.valor : null,
      data: dataISOValida(dados.data) ? dados.data : null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(limite);
  }
}

export const CupomFiscalService = {
  /**
   * @param {string} textoQr conteúdo lido do QR Code
   * @returns {Promise<{ valor: number|null, data: string|null, descricao: string, cupomFiscalUrl: string|null,
   *   numero: number, completo: boolean }>} valor em centavos, data em ISO
   */
  async interpretar(textoQr) {
    const cupom = interpretarQrCodeCupom(textoQr);
    if (!cupom) {
      throw new ErroServicoIndisponivel(
        'Esse QR Code não é de um cupom fiscal eletrônico. Leia o código impresso no rodapé do cupom ou preencha os dados manualmente.',
      );
    }

    const sefaz = cupom.url ? await consultarSefaz(textoQr) : null;
    const valor = sefaz?.valor ?? cupom.valor;
    const data = sefaz?.data ?? cupom.data;
    const emitente = sefaz?.emitente ? nomeDeEmpresa(sefaz.emitente) : null;

    return {
      valor,
      data,
      descricao: emitente ?? `Cupom fiscal nº ${cupom.numero}`,
      cupomFiscalUrl: cupom.url,
      numero: cupom.numero,
      completo: valor != null && data != null && emitente != null,
    };
  },
};
