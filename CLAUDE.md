# MeuSaldo — contexto do projeto

Aplicação web responsiva para gestão financeira compartilhada de um casal que usa o mesmo cartão de crédito e, às vezes, empresta o cartão a terceiros. Projeto acadêmico de Análise e Projeto de Sistemas II (Sistemas de Informação, UNIFEBE, 2026).

Equipe: Giovana Schmitt, Gustavo da Silva Cavalheiro Nogueira, Lucas Eduardo, Taison Pedrini.

## Stack definida no documento

- Aplicação web responsiva (Chrome, Edge e Safari, última versão)
- Firebase Firestore (modelagem não relacional, coleções e subcoleções derivadas do MER)
- Autenticação com conta Google
- Geração de relatório em PDF
- Leitura de cupom fiscal (QR Code) via serviço externo
- Framework de front-end: **a definir pelo grupo**

## Protótipo no Figma

- Arquivo: https://www.figma.com/design/DjX4nnwree1PsnQUD2yzXj (file key `DjX4nnwree1PsnQUD2yzXj`)
- Quadros: "MeuSaldo — Protótipo de alta fidelidade", "Cadastros", "Despesas — extensões e reembolso", "Planejamento financeiro", "Consultas e relatórios"
- Cada tela tem o caso de uso na legenda (ex.: "Cadastrar despesa — UC05")

Tokens visuais usados no protótipo:

| Token | Valor |
|---|---|
| Cor principal | `#0F6E56` |
| Cor principal clara | `#E1F5EE` |
| Texto | `#1F1F1D` |
| Texto secundário | `#6B6A64` |
| Borda | `#E2E0D8` |
| Fundo de alerta | `#FAEEDA` / texto `#854F0B` |
| Perigo | `#A32D2D` / fundo `#FCEBEB` |
| Sucesso | `#3B6D11` / fundo `#EAF3DE` |
| Fonte | Inter (Regular, Medium, Semi Bold, Bold) |
| Raio de cartões | 12px; botões 12px; campos 10px |

Navegação inferior: Início, Lançamentos, + (nova despesa), Terceiros, Relatórios.

## Personas

- **Thiago Silva**, 34, analista de sistemas. Controla os números, divide a fatura com a esposa, faz compras on-line a pedido da mãe.
- **Mariana Costa**, 31, designer de interiores autônoma, renda variável. Quer separar os gastos pessoais das contas da casa.
- **Dona Sônia Silva**, 68, aposentada, mãe do Thiago. Não usa o app; paga de volta em parcelas e acompanha pelos relatórios do filho.

## Requisitos funcionais

| Código | Descrição |
|---|---|
| RF001 | Autenticação por conta Google |
| RF002 | Criar e gerenciar grupo financeiro compartilhado do casal |
| RF003 | Cadastrar receitas (valor, data, descrição, categoria) |
| RF004 | Cadastrar despesas (valor, data, descrição, categoria, forma de pagamento) |
| RF005 | Identificar qual integrante realizou a movimentação |
| RF006 | Classificar despesa como pessoal, compartilhada ou de terceiro |
| RF007 | Cadastrar e gerenciar terceiros |
| RF008 | Registrar pagamentos/reembolsos de terceiros, mantendo o saldo devedor |
| RF009 | Cadastrar e gerenciar categorias |
| RF010 | Cadastrar cartões de crédito e associar despesas a eles |
| RF011 | Leitura de cupom fiscal |
| RF012 | Definir limites de orçamento por categoria |
| RF013 | Acompanhar os limites definidos |
| RF014 | Criar e gerenciar metas de economia |
| RF015 | Acompanhar progresso das metas |
| RF016 | Consultar relatórios e indicadores |
| RF017 | Dividir despesa entre integrantes e/ou terceiros |
| RF018 | Visualizar alertas quando a categoria se aproxima do limite |
| RF019 | Projeção do saldo ao final do mês (despesas, parcelas e contas futuras) |
| RF020 | Cadastrar despesas recorrentes |
| RF021 | Gerar relatório financeiro em PDF |
| RF022 | Consultar movimentações com filtros (período, pessoa, categoria, tipo, forma de pagamento) |

## Requisitos não funcionais

| Código | Descrição |
|---|---|
| RNF001 | Disponibilidade mínima de 99,5% ao mês |
| RNF002 | Log de criação, alteração e exclusão com data, hora e usuário |
| RNF003 | Datas no formato DD/MM/AAAA |
| RNF004 | Consultas paginadas, no máximo 20 registros por página |
| RNF005 | Informar o usuário quando o salvamento falhar |
| RNF006 | HTTPS e dados financeiros armazenados criptografados |
| RNF007 | Resposta em até 3 segundos |
| RNF008 | Compatível com Chrome, Edge e Safari (última versão) |
| RNF009 | Consistência visual entre telas |
| RNF010 | Contraste mínimo 4,5:1 (WCAG 2.1 AA) |
| RNF011 | Valores monetários com precisão de duas casas decimais |
| RNF012 | Indicação visual de campos obrigatórios |
| RNF013 | Demais funções continuam se a leitura de cupom estiver indisponível |

## Casos de uso

| UC | Nome | RF |
|---|---|---|
| UC01 | Autenticar usuário (ator Google) | RF001 |
| UC02 | Gerenciar grupo financeiro | RF002 |
| UC03 | Gerenciar terceiros | RF007 |
| UC04 | Cadastrar receita | RF003, RF005 |
| UC05 | Cadastrar despesa | RF004, RF005, RF006, RF010 |
| UC06 | Gerenciar cartões de crédito | RF010 |
| UC07 | Gerenciar categorias | RF009 |
| UC08 | Dividir despesa («extend» UC05) | RF017 |
| UC09 | Ler cupom fiscal («extend» UC05) | RF011 |
| UC10 | Cadastrar despesa recorrente («extend» UC05) | RF020 |
| UC11 | Registrar reembolso de terceiro | RF008 |
| UC12 | Gerenciar orçamento | RF012, RF013 |
| UC13 | Visualizar alertas de orçamento | RF018 |
| UC14 | Gerenciar metas de economia | RF014, RF015 |
| UC15 | Consultar projeção financeira | RF019 |
| UC16 | Consultar indicadores financeiros | RF016 |
| UC17 | Consultar histórico de movimentações | RF022 |
| UC18 | Gerar relatório em PDF («extend» UC16) | RF021 |

## Fluxo principal do UC05 (Cadastrar despesa)

1. Carregar categorias, cartões e terceiros do grupo.
2. Opcional: ler cupom fiscal. Se falhar, informar e seguir com preenchimento manual.
3. Informar valor, data, descrição, categoria, forma de pagamento (se cartão, escolher o cartão) e classificação.
4. Se compartilhada ou de terceiro, informar a divisão. Se recorrente, informar periodicidade e data final.
5. Validar dados; em caso de erro, mostrar inconsistência e voltar ao formulário.
6. Gravar a despesa. Se classificação = terceiro, atualizar o saldo devedor do terceiro.
7. Atualizar o consumo do orçamento da categoria e a projeção de saldo.
8. Se o valor utilizado atingir o limite, gravar notificação de alerta.

## Modelo de dados (entidades do dicionário de dados)

- **Usuario**: id, nome, email (Google), grupoId
- **GrupoFinanceiro**: id, nome, criadaEm, codigoConvite. Regra: exatamente dois usuários por grupo
- **Terceiro**: id, nome, saldoDevedor, grupoId
- **Cartao**: id, nome, banco/bandeira, limite, grupoId
- **Categoria**: id, nome, tipo (RECEITA ou DESPESA), grupoId
- **Receita**: id, descricao, data, valor, grupoId, categoriaId, usuarioId
- **Despesa**: id, descricao, data, valor, formaPagamento, classificacao, cupomFiscalUrl, recorrente, periodicidade, dataFim, abateIR, grupoId, categoriaId, usuarioId, cartaoId (opcional)
- **DivisaoDespesa**: id, valor, terceiroId, despesaId
- **Reembolso**: id, valor, data, terceiroId, despesaId
- **Orcamento**: id, periodo (AAAA-MM), limite, valorUtilizado, categoriaId
- **Meta**: id, nome, valorAlvo, valorAtual, prazo, usuarioId
- **Notificacao**: id, data, mensagem, lida, usuarioId, orcamentoId

Atenção: o dicionário usa FLOAT para valores, mas o RNF011 exige duas casas decimais sem perda por arredondamento. Na implementação, preferir armazenar valores em centavos (inteiro) e formatar na exibição.

## Convenções

- Textos da interface em português do Brasil, moeda no formato `R$ 1.234,56`
- Campos obrigatórios marcados com asterisco
- Mensagens de erro dizem o que aconteceu e o que fazer
