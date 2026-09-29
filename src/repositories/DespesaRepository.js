import { RepositorioDoGrupo } from '../core/RepositorioDoGrupo.js';
import { Despesa } from '../models/Despesa.js';

// Leitura de despesas. A gravação passa pelo DespesaService, porque envolve
// divisões, saldo de terceiros e orçamento na mesma transação (UC05).
export class DespesaRepository extends RepositorioDoGrupo {
  constructor(grupoId) {
    super(grupoId, 'despesas', Despesa);
  }
}
