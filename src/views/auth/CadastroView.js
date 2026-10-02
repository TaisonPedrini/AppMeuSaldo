import { html } from '../../utils/html.js';
import { campo, legendaObrigatorios } from '../components/campos.js';
import { TAMANHO_MINIMO_SENHA } from '../../models/Credenciais.js';
import { AuthView, cabecalhoAcesso, campoSenha } from './AuthView.js';

/** UC01: criar conta com nome, e-mail e senha. */
export class CadastroView extends AuthView {
  template() {
    return html`
      <section class="acesso">
        ${cabecalhoAcesso('Crie sua conta para começar.')}

        <form class="acesso-cartao formulario" data-form="cadastro" novalidate>
          ${legendaObrigatorios()}
          ${campo({ nome: 'nome', texto: 'Nome', obrigatorio: true, atributos: 'autocomplete="name" autocapitalize="words"' })}
          ${campo({ nome: 'email', texto: 'E-mail', tipo: 'email', obrigatorio: true, atributos: 'autocomplete="email" inputmode="email" placeholder="nome@exemplo.com"' })}
          ${campoSenha({ nome: 'senha', texto: 'Senha', autocomplete: 'new-password', dica: `Mínimo de ${TAMANHO_MINIMO_SENHA} caracteres.` })}
          ${campoSenha({ nome: 'confirmacaoSenha', texto: 'Confirme a senha', autocomplete: 'new-password' })}
          <button type="submit" class="botao botao--primario botao--bloco">Criar conta</button>
        </form>

        <p class="acesso-rodape">Já tem conta? <a class="link-acao" href="#/login">Entrar</a></p>
      </section>`;
  }

  aoCadastrar(handler) {
    this.aoEnviar('[data-form="cadastro"]', handler);
  }
}
