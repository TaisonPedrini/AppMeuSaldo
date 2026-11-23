# MeuSaldo

Aplicação web responsiva para a gestão financeira compartilhada de um casal. Projeto de Análise e Projeto de Sistemas II (Sistemas de Informação, UNIFEBE, 2026).

Equipe: Giovana Schmitt, Gustavo da Silva Cavalheiro Nogueira, Lucas Eduardo e Taison Pedrini.

## Como rodar

O projeto usa JavaScript puro com módulos ES. O Firebase é carregado por CDN, então não há etapa de build nem `npm install`.

1. Crie um projeto no [console do Firebase](https://console.firebase.google.com/). Nele:
   - ative **Authentication → Sign-in method → Google** e **E-mail/senha**;
   - crie o banco **Firestore**;
   - registre um **app web**.
2. Copie a configuração do app web para [src/config/firebase.config.js](src/config/firebase.config.js).
3. Publique as regras de [firestore.rules](firestore.rules) em Firestore → Regras.
4. Sirva a pasta por HTTP. Abrir o `index.html` direto do disco não funciona, porque os módulos ES exigem HTTP. Duas opções:
   - no VS Code, a extensão **Live Server** (botão "Go Live");
   - ou `python -m http.server 5500` na raiz do projeto.
5. Em Authentication → Configurações → Domínios autorizados, confira se `localhost` está na lista. Se usar o Live Server, que abre em `127.0.0.1:5500`, adicione também `127.0.0.1`.

### Modos de desenvolvimento

As flags ficam em [src/config/app.config.js](src/config/app.config.js):

- `AUTENTICACAO_HABILITADA = false`: o app entra direto com um usuário e um grupo fixos (`usuario-dev` / `grupo-dev`), sem as telas de login e de grupo. Como as regras de [firestore.rules](firestore.rules) exigem login, nesse modo o Firestore precisa estar em **modo de teste**.
- `PERFIL_NO_FIRESTORE = true` (padrão atual): o perfil é lido e gravado em `usuarios/{uid}`, e quem ainda não tem grupo passa pelas telas de criar grupo ou de entrar num grupo existente. Exige o Firestore criado e as regras publicadas.
- `PERFIL_NO_FIRESTORE = false` (com a autenticação ligada): o login Google funciona, mas o perfil é montado só com os dados da conta Google, sem ler nem gravar `usuarios/{uid}`, e o usuário entra no grupo `grupo-dev`.

## Arquitetura MVC

```
index.html              página única; carrega src/app.js
src/
  app.js                inicialização: login → perfil → roteador
  routes.js             caminho → ação do controller
  config/               configuração do Firebase
  lib/firebase.js       único ponto de import do SDK do Firebase
  core/                 base do MVC
    Model.js            entidade: campos, validar(), conversão para o Firestore
    Repository.js       CRUD e paginação de 20 itens (RNF004)
    RepositorioDoGrupo.js  repositório de grupos/{grupoId}/... com log (RNF002)
    View.js             render, eventos, erros de campo (RNF012)
    Controller.js       tratamento de erros e navegação (RNF005)
    Router.js           rotas por hash e guardas de login e de grupo
    Sessao.js           usuário logado e grupo
    erros.js            erros com mensagem para o usuário
  models/               M: entidades do dicionário de dados + enums
  repositories/         M: acesso ao Firestore, um por coleção
  services/             M: regras que envolvem várias entidades (transações, serviços externos)
  controllers/          C: um por caso de uso ou grupo de casos de uso
  views/                V: telas por módulo, layout e componentes
  utils/                moeda, datas, escape de HTML, validação
  styles/               tokens do Figma, base e componentes
```

### Fluxo de uma ação

```
Usuário → View (evento) → Controller → Model (entidade.validar)
                                     → Service / Repository → Firestore
                                     ← resultado ou erro
          View (render / mostrarErros / Toast) ← Controller
```

- **View** só desenha e captura eventos. Não importa repositórios nem services.
- **Controller** lê os dados da View, monta a entidade, chama o repositório ou o serviço e decide o que mostrar.
- **Model** guarda as regras: a entidade valida a si mesma, o repositório persiste e o serviço coordena as operações que envolvem mais de uma coleção.

### Implementação de referência

| Tela | Rota | Arquivos |
|---|---|---|
| Login e cadastro (UC01) | `#/login`, `#/cadastro` | AuthController, LoginView, CadastroView, AuthService, Credenciais; no PC, a vitrine animada de [vitrine.js](src/views/components/vitrine.js) |
| Criar ou entrar no grupo (UC02) | `#/grupo` | GrupoController, GrupoConfigView, GrupoService |
| Nova despesa (UC05, UC08, UC09, UC10) | `#/despesas/nova` | DespesaController, DespesaFormView, DespesaService |
| Categorias (UC07) | `#/categorias` | CategoriaController, CategoriasView, CategoriaRepository |
| Nova receita (UC04) | `#/receitas/nova` | ReceitaController, ReceitaFormView, ReceitaRepository |
| Cartões (UC06) | `#/cartoes` | CartaoController, CartoesView, CartaoRepository, DespesaRepository.listarDoPeriodo |
| Terceiros (UC03) | `#/terceiros` | TerceiroController, TerceirosView, TerceiroRepository |
| Registrar reembolso (UC11) | `#/terceiros/:id/reembolso` | TerceiroController, ReembolsoView, ReembolsoService |
| Início (UC13, UC15) | `#/` | InicioController, InicioView |
| Lançamentos (UC17) | `#/lancamentos` | LancamentoController, LancamentosView, LancamentoService |
| Orçamento (UC12) | `#/orcamentos` | OrcamentoController, OrcamentoView, OrcamentoService |
| Alertas (UC13) | `#/alertas` | OrcamentoController, AlertasView, NotificacaoRepository |
| Metas (UC14) | `#/metas` | MetaController, MetasView, MetaRepository |
| Projeção do mês (UC15) | `#/projecao` | ProjecaoController, ProjecaoView, ProjecaoService |
| Relatórios e PDF (UC16, UC18) | `#/relatorios` | RelatorioController, RelatoriosView, RelatorioService, RelatorioPdfService |
| Gerenciar grupo (UC02) | `#/grupo/gerenciar` | GrupoController, GrupoGerenciarView, GrupoService |

No PC (tela a partir de 1024px) o layout troca a navegação inferior pela barra lateral das telas "versão PC" do Figma ([LayoutView](src/views/layout/LayoutView.js)). No celular, as telas que não cabem na navegação inferior ficam nos atalhos do Início. Use `.pagina-cabecalho`, `.pagina-dupla` (conteúdo + painel) e `.grade-2` (campos lado a lado) nas telas novas.

Regras de cálculo que valem para todas as telas:

- **Alertas de orçamento** (RF018): gerados ao cadastrar a despesa, quando o consumo da categoria cruza 80% e 100% do limite (`LIMIARES_ALERTA` em [DespesaService](src/services/DespesaService.js)).
- **Projeção** (RF019): receitas − despesas lançadas no mês − ocorrências futuras das despesas recorrentes ([ProjecaoService](src/services/ProjecaoService.js)). Não há cadastro de parcelas, então elas não entram.
- **Lançamentos** (RF022, RNF004): o mês é lido inteiro e filtrado no navegador, para não precisar de um índice composto para cada combinação de filtros; a lista mostra 20 itens por página.
- **PDF** (RF021): gerado no navegador com o jsPDF, baixado do cdnjs na primeira vez que o relatório é gerado.

### Leitura de cupom fiscal (UC09)

Na tela Nova despesa, "Ler cupom fiscal" abre a câmera traseira (ou aceita uma foto do cupom) e lê o QR Code da NFC-e.

| Etapa | Arquivo |
|---|---|
| Janela da câmera e envio de foto | [LeitorQrCode.js](src/views/components/LeitorQrCode.js) |
| Decodificação do QR Code (BarcodeDetector nativo ou jsQR por CDN) | [lib/qrcode.js](src/lib/qrcode.js) |
| Interpretação: chave de acesso, UF, número, URL da SEFAZ; valor e data quando o QR traz | [utils/nfce.js](src/utils/nfce.js) |
| Consulta à SEFAZ e montagem dos dados do formulário | [CupomFiscalService](src/services/CupomFiscalService.js) |
| Busca da página da SEFAZ no servidor (contorna o CORS) | [functions/](functions/index.js) |

Formatos aceitos: NFC-e versões 1, 2 e 3 (emissão normal e em contingência) e CF-e SAT de São Paulo. O endereço da nota fica gravado em `cupomFiscalUrl` da despesa.

Na emissão normal da NFC-e, que é a mais comum, o QR Code traz só a chave; valor, data e emitente ficam na página da SEFAZ. Para buscá-los:

1. Mude o projeto do Firebase para o plano **Blaze** (Cloud Functions exigem; o uso deste app cabe na cota gratuita).
2. Instale e publique a função:
   ```bash
   cd functions && npm install && npm test && cd .. && firebase deploy --only functions
   ```
3. Copie o endereço exibido no deploy (`https://southamerica-east1-<projeto>.cloudfunctions.net/consultarCupom`) para `CUPOM_CONSULTA_URL` em [app.config.js](src/config/app.config.js).

Sem a função (ou se a SEFAZ não responder), o app preenche o que o QR Code traz, vincula o cupom e pede para o usuário informar o que faltou (RNF013).

### Convenções de dados

- **Valores monetários** em centavos (inteiro), por causa do RNF011. Use `paraCentavos` e `formatarMoeda` de [src/utils/moeda.js](src/utils/moeda.js).
- **Datas** em texto ISO `AAAA-MM-DD` e exibidas como `DD/MM/AAAA` (RNF003), com [src/utils/data.js](src/utils/data.js).
- **Orçamento**: id `AAAA-MM_categoriaId`, o que garante um único orçamento por categoria no mês.
- **Consultas** com `where` em um campo e `orderBy` em outro exigem índice composto. Declare-o em [firestore.indexes.json](firestore.indexes.json).
