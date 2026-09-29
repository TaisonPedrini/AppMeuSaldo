// Acumula erros de validação no formato { campo, mensagem } usado pelas Views.
export class Validador {
  constructor() {
    this.erros = [];
  }

  /** Campo obrigatório. `rotulo` com artigo: "a descrição", "o cartão". */
  exigir(campo, valor, rotulo) {
    const vazio = valor === null || valor === undefined || (typeof valor === 'string' && valor.trim() === '');
    if (vazio) this.erros.push({ campo, mensagem: `Informe ${rotulo}.` });
    return this;
  }

  /** Adiciona `mensagem` quando `condicao` for falsa. Não repete erro em campo que já falhou. */
  regra(condicao, campo, mensagem) {
    if (!condicao && !this.erros.some((e) => e.campo === campo)) this.erros.push({ campo, mensagem });
    return this;
  }

  valorPositivo(campo, centavos) {
    return this.regra(
      Number.isInteger(centavos) && centavos > 0,
      campo,
      'Informe um valor maior que zero, com até duas casas decimais.',
    );
  }
}
