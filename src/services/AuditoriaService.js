// Log de criação, alteração e exclusão com data, hora e usuário (RNF002).
// Os registros ficam em grupos/{grupoId}/logs.
import { db, collection, doc, addDoc, serverTimestamp } from '../lib/firebase.js';
import { Sessao } from '../core/Sessao.js';

export function dadosDoLog(acao, entidade, entidadeId) {
  return {
    acao,
    entidade,
    entidadeId,
    usuarioId: Sessao.usuario?.id ?? null,
    data: serverTimestamp(),
  };
}

export async function registrarLog(grupoId, acao, entidade, entidadeId) {
  await addDoc(collection(db, 'grupos', grupoId, 'logs'), dadosDoLog(acao, entidade, entidadeId));
}

/** Versão para gravar o log dentro de uma transação ou batch, junto com a própria alteração. */
export function registrarLogEm(transacao, grupoId, acao, entidade, entidadeId) {
  transacao.set(doc(collection(db, 'grupos', grupoId, 'logs')), dadosDoLog(acao, entidade, entidadeId));
}
