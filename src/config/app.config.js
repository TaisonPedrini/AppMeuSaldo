// Com a autenticação desabilitada, o app entra direto com o usuário e o grupo abaixo,
// sem login Google. Use apenas durante o desenvolvimento e habilite antes de publicar.
// Atenção: as regras de firestore.rules exigem login; com a autenticação desabilitada,
// o Firestore precisa estar em modo de teste para aceitar leituras e gravações.
export const AUTENTICACAO_HABILITADA = true;

// Enquanto false, o perfil vem só da conta Google (sem ler ou gravar usuarios/{uid})
// e o usuário entra no grupo de USUARIO_DESENVOLVIMENTO. Ligue quando o Firestore estiver configurado.
export const PERFIL_NO_FIRESTORE = false;

export const USUARIO_DESENVOLVIMENTO = Object.freeze({
  id: 'usuario-dev',
  nome: 'Usuário de Teste',
  email: 'teste@meusaldo.dev',
  grupoId: 'grupo-dev',
});
