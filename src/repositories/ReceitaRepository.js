import { RepositorioDoGrupo } from '../core/RepositorioDoGrupo.js';
import { Receita } from '../models/Receita.js';

export class ReceitaRepository extends RepositorioDoGrupo {
  constructor(grupoId) {
    super(grupoId, 'receitas', Receita);
  }
}
