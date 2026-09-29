import { Controller } from '../core/Controller.js';
import { InicioView } from '../views/inicio/InicioView.js';

export class InicioController extends Controller {
  index() {
    new InicioView(this.conteudo).render({ nomeUsuario: this.usuario.nome.split(' ')[0] });
  }
}
