// Projeção do saldo ao final do mês (RF019 / UC15).
// Calculada na leitura, a partir das receitas e despesas lançadas no mês e das ocorrências
// de despesas recorrentes que ainda vão acontecer, em vez de ser gravada a cada despesa (UC05, passo 7).
import { where } from '../lib/firebase.js';
import { Periodicidade } from '../models/enums.js';
import { DespesaRepository } from '../repositories/DespesaRepository.js';
import { ReceitaRepository } from '../repositories/ReceitaRepository.js';
import { faixaDoMes } from '../utils/data.js';

/** Último dia do mês "AAAA-MM", em ISO. */
export function ultimoDiaDoMes(periodo) {
  const [ano, mes] = periodo.split('-').map(Number);
  const dia = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  return `${periodo}-${String(dia).padStart(2, '0')}`;
}

function somarDias(iso, dias) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia + dias)).toISOString().slice(0, 10);
}

/**
 * Datas em que uma despesa recorrente se repete dentro do mês, sem contar o próprio lançamento
 * (que já está nas despesas). Mensal e anual caem no mesmo dia do lançamento original
 * (ou no último dia do mês, se ele for menor).
 * @param {import('../models/Despesa.js').Despesa} despesa
 */
export function ocorrenciasNoMes(despesa, periodo) {
  if (!despesa.recorrente) return [];
  const [inicio] = faixaDoMes(periodo);
  const fim = ultimoDiaDoMes(periodo);
  const limite = despesa.dataFim && despesa.dataFim < fim ? despesa.dataFim : fim;
  const datas = [];

  if (despesa.periodicidade === Periodicidade.SEMANAL) {
    let data = somarDias(despesa.data, 7);
    while (data <= limite) {
      if (data >= inicio) datas.push(data);
      data = somarDias(data, 7);
    }
    return datas;
  }

  const [anoOrigem, mesOrigem, diaOrigem] = despesa.data.split('-');
  const [, mesPeriodo] = periodo.split('-');
  if (despesa.periodicidade === Periodicidade.ANUAL && mesPeriodo !== mesOrigem) return [];
  if (despesa.periodicidade !== Periodicidade.MENSAL && despesa.periodicidade !== Periodicidade.ANUAL) return [];

  const dia = Math.min(Number(diaOrigem), Number(fim.slice(8)));
  const data = `${periodo}-${String(dia).padStart(2, '0')}`;
  const posterior = `${anoOrigem}-${mesOrigem}` < periodo;
  return posterior && data <= limite ? [data] : [];
}

export class ProjecaoService {
  constructor(grupoId) {
    this.grupoId = grupoId;
  }

  /**
   * @param {string} periodo "AAAA-MM"
   * @returns {Promise<{ receitas: number, despesas: number, saldoAtual: number,
   *   contasFuturas: { descricao: string, data: string, valor: number }[], totalFuturas: number,
   *   saldoProjetado: number, dataProjecao: string }>} valores em centavos
   */
  async calcular(periodo) {
    const despesasRepo = new DespesaRepository(this.grupoId);
    const [despesas, receitas, recorrentes] = await Promise.all([
      despesasRepo.listarDoPeriodo(periodo),
      new ReceitaRepository(this.grupoId).listarDoPeriodo(periodo),
      despesasRepo.listarTodos({ restricoes: [where('recorrente', '==', true)], ordenarPor: 'data' }),
    ]);

    const contasFuturas = recorrentes
      .flatMap((d) => ocorrenciasNoMes(d, periodo).map((data) => ({ descricao: d.descricao, data, valor: d.valor })))
      .sort((a, b) => a.data.localeCompare(b.data));

    const totalReceitas = receitas.reduce((soma, r) => soma + r.valor, 0);
    const totalDespesas = despesas.reduce((soma, d) => soma + d.valor, 0);
    const totalFuturas = contasFuturas.reduce((soma, c) => soma + c.valor, 0);

    return {
      receitas: totalReceitas,
      despesas: totalDespesas,
      saldoAtual: totalReceitas - totalDespesas,
      contasFuturas,
      totalFuturas,
      saldoProjetado: totalReceitas - totalDespesas - totalFuturas,
      dataProjecao: ultimoDiaDoMes(periodo),
    };
  }
}
