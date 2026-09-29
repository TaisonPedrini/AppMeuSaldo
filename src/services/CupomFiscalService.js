// Leitura de cupom fiscal por QR Code via serviço externo (RF011 / UC09).
// Qualquer falha vira ErroServicoIndisponivel, e o formulário continua em modo manual (RNF013).
import { ErroServicoIndisponivel } from '../core/erros.js';

export const CupomFiscalService = {
  /**
   * @returns {Promise<{ valor?: number, data?: string, descricao?: string, cupomFiscalUrl?: string }>}
   *   valor em centavos, data em ISO
   */
  async ler() {
    // A definir: captura do QR Code pela câmera e consulta ao serviço externo da NFC-e.
    throw new ErroServicoIndisponivel('A leitura de cupom está indisponível no momento. Preencha os dados manualmente.');
  },
};
