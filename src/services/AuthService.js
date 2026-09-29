// Autenticação com conta Google (RF001 / UC01).
import { auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from '../lib/firebase.js';
import { ErroAplicacao } from '../core/erros.js';

export const AuthService = {
  async entrarComGoogle() {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (erro) {
      if (erro.code === 'auth/popup-closed-by-user' || erro.code === 'auth/cancelled-popup-request') return;
      if (erro.code === 'auth/popup-blocked') {
        throw new ErroAplicacao('O navegador bloqueou a janela de login. Permita pop-ups para este site e tente de novo.', erro);
      }
      throw new ErroAplicacao('Não foi possível entrar com o Google. Verifique sua conexão e tente novamente.', erro);
    }
  },

  sair() {
    return signOut(auth);
  },

  /** Chama `callback(contaGoogle | null)` sempre que o login mudar. */
  observar(callback) {
    return onAuthStateChanged(auth, callback);
  },
};
