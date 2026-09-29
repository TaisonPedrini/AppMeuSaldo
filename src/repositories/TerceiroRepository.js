import { RepositorioDoGrupo } from '../core/RepositorioDoGrupo.js';
import { Terceiro } from '../models/Terceiro.js';

export class TerceiroRepository extends RepositorioDoGrupo {
  constructor(grupoId) {
    super(grupoId, 'terceiros', Terceiro);
  }
}
