import { RepositorioDoGrupo } from '../core/RepositorioDoGrupo.js';
import { where } from '../lib/firebase.js';
import { Orcamento } from '../models/Orcamento.js';

export class OrcamentoRepository extends RepositorioDoGrupo {
  constructor(grupoId) {
    super(grupoId, 'orcamentos', Orcamento);
  }

  /** Define (ou redefine) o limite da categoria no mês (UC12). */
  definir(orcamento) {
    return this.salvarComId(orcamento);
  }

  listarDoPeriodo(periodo) {
    return this.listarTodos({ restricoes: [where('periodo', '==', periodo)], ordenarPor: 'categoriaId' });
  }
}
