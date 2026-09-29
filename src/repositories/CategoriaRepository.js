import { RepositorioDoGrupo } from '../core/RepositorioDoGrupo.js';
import { where } from '../lib/firebase.js';
import { Categoria } from '../models/Categoria.js';

export class CategoriaRepository extends RepositorioDoGrupo {
  constructor(grupoId) {
    super(grupoId, 'categorias', Categoria);
  }

  listarPorTipo(tipo) {
    return this.listarTodos({ restricoes: [where('tipo', '==', tipo)] });
  }
}
