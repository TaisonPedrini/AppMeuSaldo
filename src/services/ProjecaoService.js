// Projeção do saldo ao final do mês (RF019 / UC15).
// Calculada na leitura, a partir de receitas, despesas lançadas, parcelas e despesas recorrentes,
// em vez de ser gravada a cada despesa (UC05, passo 7).
export class ProjecaoService {
  constructor(grupoId) {
    this.grupoId = grupoId;
  }

  /**
   * @param {string} _periodo "AAAA-MM"
   * @returns {Promise<{ receitas: number, despesas: number, recorrentesFuturas: number, saldoProjetado: number }>} centavos
   */
  async calcular(_periodo) {
    throw new Error('ProjecaoService.calcular ainda não implementado (UC15).');
  }
}
