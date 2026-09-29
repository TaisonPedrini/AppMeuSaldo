import { Repository } from '../core/Repository.js';
import { protegido } from '../core/erros.js';
import { getDoc, setDoc, serverTimestamp } from '../lib/firebase.js';
import { Usuario } from '../models/Usuario.js';

export class UsuarioRepository extends Repository {
  constructor() {
    super(['usuarios'], Usuario);
  }

  /** Busca o perfil do usuário do Google; cria no primeiro acesso (UC01). */
  async garantir(contaGoogle) {
    return protegido(async () => {
      const ref = this.ref(contaGoogle.uid);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) return this.converter(snapshot);

      const usuario = new Usuario({
        id: contaGoogle.uid,
        nome: contaGoogle.displayName ?? '',
        email: contaGoogle.email ?? '',
      });
      await setDoc(ref, { ...usuario.toFirestore(), criadoEm: serverTimestamp() });
      return usuario;
    }, 'Não foi possível carregar seu perfil. Recarregue a página para tentar de novo.');
  }
}
