// Leitura de cupom fiscal por QR Code (RF011 / UC09).
// Usa só o que o QR Code traz: número da nota e endereço da consulta na SEFAZ e, na emissão em
// contingência, na NFC-e versão 1 e no CF-e SAT, também valor e data. A SEFAZ não é consultada,
// então o que faltar o usuário completa no formulário (RNF013).
import { ErroServicoIndisponivel } from '../core/erros.js';
import { interpretarQrCodeCupom } from '../utils/nfce.js';

export const CupomFiscalService = {
  /**
   * @param {string} textoQr conteúdo lido do QR Code
   * @returns {{ valor: number|null, data: string|null, descricao: string, cupomFiscalUrl: string|null, numero: number }}
   *   valor em centavos, data em ISO
   */
  interpretar(textoQr) {
    const cupom = interpretarQrCodeCupom(textoQr);
    if (!cupom) {
      throw new ErroServicoIndisponivel(
        'Esse QR Code não é de um cupom fiscal eletrônico. Leia o código impresso no rodapé do cupom ou preencha os dados manualmente.',
      );
    }
    return {
      valor: cupom.valor,
      data: cupom.data,
      descricao: `Cupom fiscal nº ${cupom.numero}`,
      cupomFiscalUrl: cupom.url,
      numero: cupom.numero,
    };
  },
};
