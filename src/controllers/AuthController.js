import { Controller } from '../core/Controller.js';
import { AuthService } from '../services/AuthService.js';
import { Login, Cadastro } from '../models/Credenciais.js';
import { LoginView } from '../views/auth/LoginView.js';
import { CadastroView } from '../views/auth/CadastroView.js';
import { Toast } from '../views/components/Toast.js';

/** UC01 — Autenticar usuário. Depois do login, o app.js carrega o perfil e o Router redireciona. */
export class AuthController extends Controller {
  login() {
    const view = new LoginView(this.conteudo).render();

    view.aoEntrar((dados) => this.executar(view, 'button[type="submit"]', () => AuthService.entrarComEmail(new Login(dados))));

    view.aoEntrarComGoogle(() => this.executar(view, '[data-acao="entrar-google"]', () => AuthService.entrarComGoogle()));

    view.aoRedefinirSenha((email) => this.executar(view, '[data-acao="redefinir"]', async () => {
      await AuthService.redefinirSenha(email);
      Toast.sucesso('Se existir uma conta com este e-mail, enviamos um link para criar uma nova senha.');
    }));
  }

  cadastro() {
    const view = new CadastroView(this.conteudo).render();

    view.aoCadastrar((dados) => this.executar(view, 'button[type="submit"]', async () => {
      await AuthService.cadastrar(new Cadastro(dados));
      // O Router já levou ao Início antes do nome ser gravado; desenha de novo com o nome certo.
      this.navegar('/');
    }));
  }

  async executar(view, seletorBotao, operacao) {
    view.limparErros();
    view.ocupado(true, seletorBotao);
    try {
      await operacao();
    } catch (erro) {
      this.tratarErro(erro, view);
    } finally {
      view.ocupado(false, seletorBotao);
    }
  }
}
