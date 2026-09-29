import { RepositorioDoGrupo } from '../core/RepositorioDoGrupo.js';
import { Reembolso } from '../models/Reembolso.js';

export class ReembolsoRepository extends RepositorioDoGrupo {
  constructor(grupoId, terceiroId) {
    super(grupoId, ['terceiros', terceiroId, 'reembolsos'], Reembolso);
  }
}
