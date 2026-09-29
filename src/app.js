// Ponto de entrada: acompanha o login, carrega o perfil do usuário e inicia o roteador.
import { Router } from './core/Router.js';
import { Sessao } from './core/Sessao.js';
import { rotas } from './routes.js';
import { AUTENTICACAO_HABILITADA, USUARIO_DESENVOLVIMENTO } from './config/app.config.js';
import { AuthService } from './services/AuthService.js';
import { UsuarioRepository } from './repositories/UsuarioRepository.js';
import { Usuario } from './models/Usuario.js';
import { Toast } from './views/components/Toast.js';

const router = new Router(rotas, {
  raiz: document.getElementById('app'),
  aoSair: AUTENTICACAO_HABILITADA ? () => AuthService.sair() : null,
});

if (AUTENTICACAO_HABILITADA) {
  let iniciado = false;

  AuthService.observar(async (contaGoogle) => {
    try {
      Sessao.definir(contaGoogle ? await new UsuarioRepository().garantir(contaGoogle) : null);
    } catch (erro) {
      console.error(erro);
      Toast.erro(erro.mensagemUsuario);
      Sessao.definir(null);
    }

    if (iniciado) {
      router.resolver();
    } else {
      iniciado = true;
      router.iniciar();
    }
  });
} else {
  Sessao.definir(new Usuario(USUARIO_DESENVOLVIMENTO));
  router.iniciar();
}
