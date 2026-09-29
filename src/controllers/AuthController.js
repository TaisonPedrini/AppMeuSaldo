import { Controller } from '../core/Controller.js';
import { AuthService } from '../services/AuthService.js';
import { LoginView } from '../views/auth/LoginView.js';

/** UC01 — Autenticar usuário. Depois do login, o app.js carrega o perfil e o Router redireciona. */
export class AuthController extends Controller {
  login() {
    const view = new LoginView(this.conteudo).render();
    view.aoEntrar(async () => {
      view.ocupado(true, '[data-acao="entrar"]');
      try {
        await AuthService.entrarComGoogle();
      } catch (erro) {
        this.tratarErro(erro);
      } finally {
        view.ocupado(false, '[data-acao="entrar"]');
      }
    });
  }
}
