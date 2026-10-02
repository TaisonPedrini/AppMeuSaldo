import { Model } from '../core/Model.js';
import { Validador } from '../utils/Validador.js';

/** Mínimo exigido pelo Firebase Auth. */
export const TAMANHO_MINIMO_SENHA = 6;

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Dados do formulário de login (UC01). Não é gravado: a senha fica só no Firebase Auth. */
export class Login extends Model {
  constructor(dados = {}) {
    super(dados);
    this.email = (dados.email ?? '').trim();
    this.senha = dados.senha ?? '';
  }

  validar() {
    return this.validador().erros;
  }

  validador() {
    return new Validador()
      .exigir('email', this.email, 'o e-mail')
      .regra(FORMATO_EMAIL.test(this.email), 'email', 'Informe um e-mail válido, como nome@exemplo.com.')
      .exigir('senha', this.senha, 'a senha');
  }
}

/** Dados do formulário de criação de conta (UC01). */
export class Cadastro extends Login {
  constructor(dados = {}) {
    super(dados);
    this.nome = (dados.nome ?? '').trim();
    this.confirmacaoSenha = dados.confirmacaoSenha ?? '';
  }

  validar() {
    return this.validador()
      .exigir('nome', this.nome, 'o seu nome')
      .regra(this.senha.length >= TAMANHO_MINIMO_SENHA, 'senha', `A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`)
      .exigir('confirmacaoSenha', this.confirmacaoSenha, 'a confirmação da senha')
      .regra(this.confirmacaoSenha === this.senha, 'confirmacaoSenha', 'As senhas não conferem. Digite a mesma senha nos dois campos.')
      .erros;
  }
}
