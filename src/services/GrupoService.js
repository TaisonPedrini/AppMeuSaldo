// Criação do grupo do casal e entrada por código de convite (RF002 / UC02).
// Cada código tem um documento em convites/{codigo} → { grupoId }, lido por id,
// para que quem ainda não é membro não precise consultar a coleção de grupos.
import { db, collection, doc, runTransaction, serverTimestamp } from '../lib/firebase.js';
import { ErroRegraNegocio, ErroValidacao, protegido } from '../core/erros.js';
import { GrupoFinanceiro, MAXIMO_INTEGRANTES } from '../models/GrupoFinanceiro.js';
import { registrarLogEm } from './AuditoriaService.js';

const ALFABETO_CONVITE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O e 1/I, fáceis de confundir

function gerarCodigoConvite(tamanho = 6) {
  const bytes = crypto.getRandomValues(new Uint8Array(tamanho));
  return Array.from(bytes, (b) => ALFABETO_CONVITE[b % ALFABETO_CONVITE.length]).join('');
}

export const GrupoService = {
  /** @returns {Promise<string>} id do grupo criado */
  async criar(nome, usuario) {
    const grupo = new GrupoFinanceiro({ nome: nome?.trim(), codigoConvite: gerarCodigoConvite(), membros: [usuario.id] });
    const erros = grupo.validar();
    if (erros.length) throw new ErroValidacao(erros);

    return protegido(() => runTransaction(db, async (tx) => {
      const grupoRef = doc(collection(db, 'grupos'));
      const conviteRef = doc(db, 'convites', grupo.codigoConvite);
      if ((await tx.get(conviteRef)).exists()) throw new ErroRegraNegocio('Não foi possível gerar o convite. Tente novamente.');

      tx.set(grupoRef, { ...grupo.toFirestore(), criadaEm: serverTimestamp() });
      tx.set(conviteRef, { grupoId: grupoRef.id });
      tx.update(doc(db, 'usuarios', usuario.id), { grupoId: grupoRef.id });
      registrarLogEm(tx, grupoRef.id, 'CRIAR', 'GrupoFinanceiro', grupoRef.id);
      return grupoRef.id;
    }), 'Não foi possível criar o grupo. Verifique sua conexão e tente novamente.');
  },

  /** @returns {Promise<string>} id do grupo em que o usuário entrou */
  async entrar(codigo, usuario) {
    const codigoNormalizado = String(codigo ?? '').trim().toUpperCase();
    if (!codigoNormalizado) throw new ErroValidacao([{ campo: 'codigo', mensagem: 'Informe o código de convite.' }]);

    return protegido(() => runTransaction(db, async (tx) => {
      const convite = await tx.get(doc(db, 'convites', codigoNormalizado));
      if (!convite.exists()) {
        throw new ErroValidacao([{ campo: 'codigo', mensagem: 'Código não encontrado. Confira o código com quem criou o grupo.' }]);
      }

      const { grupoId } = convite.data();
      const grupoRef = doc(db, 'grupos', grupoId);
      const grupo = GrupoFinanceiro.fromFirestore(grupoId, (await tx.get(grupoRef)).data());
      if (grupo.membros.includes(usuario.id)) return grupoId;
      if (grupo.membros.length >= MAXIMO_INTEGRANTES) {
        throw new ErroRegraNegocio('Este grupo já tem dois integrantes. Peça um novo convite ou crie o seu grupo.');
      }

      tx.update(grupoRef, { membros: [...grupo.membros, usuario.id] });
      tx.update(doc(db, 'usuarios', usuario.id), { grupoId });
      registrarLogEm(tx, grupoId, 'ALTERAR', 'GrupoFinanceiro', grupoId);
      return grupoId;
    }), 'Não foi possível entrar no grupo. Verifique sua conexão e tente novamente.');
  },
};
