// Erros com mensagem pronta para o usuário (RNF005): dizem o que aconteceu e o que fazer.
export const MENSAGEM_PADRAO = 'Não foi possível concluir a operação. Verifique sua conexão e tente novamente.';

export class ErroAplicacao extends Error {
  constructor(mensagemUsuario = MENSAGEM_PADRAO, causa) {
    super(mensagemUsuario, { cause: causa });
    this.name = this.constructor.name;
    this.mensagemUsuario = mensagemUsuario;
  }
}

/** Dados inválidos. `erros` é uma lista de { campo, mensagem }. */
export class ErroValidacao extends ErroAplicacao {
  constructor(erros) {
    super('Revise os campos destacados e tente novamente.');
    this.erros = erros;
  }
}

/** Falha ao ler ou gravar no Firestore. */
export class ErroPersistencia extends ErroAplicacao {}

/** Violação de regra de negócio (ex.: grupo já tem dois integrantes). */
export class ErroRegraNegocio extends ErroAplicacao {}

/** Serviço externo fora do ar (ex.: leitura de cupom, RNF013). */
export class ErroServicoIndisponivel extends ErroAplicacao {}

/** Executa uma operação de dados, convertendo falhas inesperadas em ErroPersistencia. */
export async function protegido(operacao, mensagemUsuario = MENSAGEM_PADRAO) {
  try {
    return await operacao();
  } catch (erro) {
    if (erro instanceof ErroAplicacao) throw erro;
    throw new ErroPersistencia(mensagemUsuario, erro);
  }
}
