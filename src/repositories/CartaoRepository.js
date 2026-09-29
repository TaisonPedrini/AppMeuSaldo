import { RepositorioDoGrupo } from '../core/RepositorioDoGrupo.js';
import { Cartao } from '../models/Cartao.js';

export class CartaoRepository extends RepositorioDoGrupo {
  constructor(grupoId) {
    super(grupoId, 'cartoes', Cartao);
  }
}
