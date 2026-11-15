import { RepositorioDoGrupo } from '../core/RepositorioDoGrupo.js';
import { where } from '../lib/firebase.js';
import { Despesa } from '../models/Despesa.js';
import { faixaDoMes } from '../utils/data.js';

// Leitura de despesas. A gravação passa pelo DespesaService, porque envolve
// divisões, saldo de terceiros e orçamento na mesma transação (UC05).
export class DespesaRepository extends RepositorioDoGrupo {
  constructor(grupoId) {
    super(grupoId, 'despesas', Despesa);
  }

  /**
   * Todas as despesas do mês ("AAAA-MM"), para totais e indicadores.
   * Filtra só pela data, então não exige índice composto no Firestore.
   */
  listarDoPeriodo(periodo) {
    const [inicio, fim] = faixaDoMes(periodo);
    return this.listarTodos({ restricoes: [where('data', '>=', inicio), where('data', '<=', fim)], ordenarPor: 'data' });
  }
}
