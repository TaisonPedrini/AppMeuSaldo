// Autenticação com conta Google ou e-mail e senha (RF001 / UC01).
import {
  auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail,
} from '../lib/firebase.js';
import { ErroAplicacao, ErroValidacao } from '../core/erros.js';
import { Sessao } from '../core/Sessao.js';

const CREDENCIAIS_INCORRETAS = "E-mail ou senha incorretos. Confira os dados ou use 'Esqueci minha senha'.";

/** Erros que apontam para um campo do formulário. */
const ERROS_DE_CAMPO = {
  'auth/invalid-credential': ['senha', CREDENCIAIS_INCORRETAS],
  'auth/wrong-password': ['senha', CREDENCIAIS_INCORRETAS],
  'auth/user-not-found': ['senha', CREDENCIAIS_INCORRETAS],
  'auth/email-already-in-use': ['email', "Já existe uma conta com este e-mail. Entre com ele ou use 'Esqueci minha senha'."],
  'auth/invalid-email': ['email', 'Informe um e-mail válido, como nome@exemplo.com.'],
  'auth/missing-email': ['email', 'Informe o e-mail.'],
  'auth/weak-password': ['senha', 'Escolha uma senha mais forte, com pelo menos 6 caracteres.'],
};

const ERROS_GERAIS = {
  'auth/popup-blocked': 'O navegador bloqueou a janela de login. Permita pop-ups para este site e tente de novo.',
  'auth/too-many-requests': 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com a internet. Verifique a rede e tente de novo.',
  'auth/unauthorized-domain': 'Este endereço não está autorizado para login. Adicione o domínio em Authentication → Settings → Authorized domains no Firebase.',
  'auth/operation-not-allowed': 'Esta forma de login não está ativada no Firebase. Ative em Authentication → Sign-in method.',
};

function traduzirErro(erro) {
  if (erro instanceof ErroAplicacao) return erro;
  const deCampo = ERROS_DE_CAMPO[erro.code];
  if (deCampo) return new ErroValidacao([{ campo: deCampo[0], mensagem: deCampo[1] }]);
  const geral = ERROS_GERAIS[erro.code];
  if (geral) return new ErroAplicacao(geral, erro);
  return new ErroAplicacao(`Não foi possível entrar. Verifique sua conexão e tente novamente. (${erro.code ?? 'erro desconhecido'})`, erro);
}

function garantirValido(entidade) {
  const erros = entidade.validar();
  if (erros.length) throw new ErroValidacao(erros);
}

export const AuthService = {
  async entrarComGoogle() {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (erro) {
      if (erro.code === 'auth/popup-closed-by-user' || erro.code === 'auth/cancelled-popup-request') return;
      throw traduzirErro(erro);
    }
  },

  /** @param {import('../models/Credenciais.js').Login} login */
  async entrarComEmail(login) {
    garantirValido(login);
    try {
      await signInWithEmailAndPassword(auth, login.email, login.senha);
    } catch (erro) {
      throw traduzirErro(erro);
    }
  },

  /** Cria a conta e grava o nome no perfil do Firebase Auth. */
  async cadastrar(cadastro) {
    garantirValido(cadastro);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, cadastro.email, cadastro.senha);
      await updateProfile(user, { displayName: cadastro.nome });
      // O onAuthStateChanged dispara antes do nome ser gravado; corrige a sessão já carregada.
      if (Sessao.usuario?.id === user.uid) Sessao.usuario.nome = cadastro.nome;
    } catch (erro) {
      throw traduzirErro(erro);
    }
  },

  async redefinirSenha(email) {
    const limpo = (email ?? '').trim();
    if (!limpo) throw new ErroValidacao([{ campo: 'email', mensagem: 'Informe o e-mail da conta para receber o link.' }]);
    try {
      await sendPasswordResetEmail(auth, limpo);
    } catch (erro) {
      throw traduzirErro(erro);
    }
  },

  sair() {
    return signOut(auth);
  },

  /** Chama `callback(conta | null)` sempre que o login mudar. */
  observar(callback) {
    return onAuthStateChanged(auth, callback);
  },
};
