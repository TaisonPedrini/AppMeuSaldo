// Geração do relatório financeiro em PDF (RF021 / UC18).
// Sugestão: jsPDF via CDN (https://cdnjs.cloudflare.com/ajax/libs/jspdf/), gerado no próprio navegador.
export const RelatorioPdfService = {
  /**
   * @param {{ periodo: string, indicadores: object, movimentacoes: object[] }} _dados
   * @returns {Promise<Blob>}
   */
  async gerar(_dados) {
    throw new Error('RelatorioPdfService.gerar ainda não implementado (UC18).');
  },
};
