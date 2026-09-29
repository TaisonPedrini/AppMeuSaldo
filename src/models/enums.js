// Valores fixos do domínio e seus rótulos na interface.

export const Classificacao = Object.freeze({
  PESSOAL: 'PESSOAL',
  COMPARTILHADA: 'COMPARTILHADA',
  TERCEIRO: 'TERCEIRO',
});

export const FormaPagamento = Object.freeze({
  CREDITO: 'CREDITO',
  DEBITO: 'DEBITO',
  PIX: 'PIX',
  DINHEIRO: 'DINHEIRO',
  BOLETO: 'BOLETO',
});

export const TipoCategoria = Object.freeze({
  RECEITA: 'RECEITA',
  DESPESA: 'DESPESA',
});

export const Periodicidade = Object.freeze({
  SEMANAL: 'SEMANAL',
  MENSAL: 'MENSAL',
  ANUAL: 'ANUAL',
});

export const Rotulos = Object.freeze({
  [Classificacao.PESSOAL]: 'Pessoal',
  [Classificacao.COMPARTILHADA]: 'Compartilhada',
  [Classificacao.TERCEIRO]: 'De terceiro',
  [FormaPagamento.CREDITO]: 'Cartão de crédito',
  [FormaPagamento.DEBITO]: 'Débito',
  [FormaPagamento.PIX]: 'Pix',
  [FormaPagamento.DINHEIRO]: 'Dinheiro',
  [FormaPagamento.BOLETO]: 'Boleto',
  [TipoCategoria.RECEITA]: 'Receita',
  [TipoCategoria.DESPESA]: 'Despesa',
  [Periodicidade.SEMANAL]: 'Semanal',
  [Periodicidade.MENSAL]: 'Mensal',
  [Periodicidade.ANUAL]: 'Anual',
});
