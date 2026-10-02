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
- `PERFIL_NO_FIRESTORE = false` (padrão atual, com a autenticação ligada): o login Google funciona, mas o perfil é montado só com os dados da conta Google, sem ler nem gravar `usuarios/{uid}`, e o usuário entra no grupo `grupo-dev`. Ligue a flag quando o Firestore estiver criado e as regras publicadas; a partir daí entram as telas de criar grupo e de entrar num grupo existente.

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
| Login e cadastro (UC01) | `#/login`, `#/cadastro` | AuthController, LoginView, CadastroView, AuthService, Credenciais |
| Criar ou entrar no grupo (UC02) | `#/grupo` | GrupoController, GrupoConfigView, GrupoService |
| Nova despesa (UC05, UC08, UC09, UC10) | `#/despesas/nova` | DespesaController, DespesaFormView, DespesaService |
| Categorias (UC07) | `#/categorias` | CategoriaController, CategoriasView, CategoriaRepository |

As demais rotas já existem e mostram "em construção", indicando os casos de uso de cada uma. Para implementar uma delas, copie o padrão de Categorias (CRUD simples) ou de Nova despesa (formulário com regras).

### Convenções de dados

- **Valores monetários** em centavos (inteiro), por causa do RNF011. Use `paraCentavos` e `formatarMoeda` de [src/utils/moeda.js](src/utils/moeda.js).
- **Datas** em texto ISO `AAAA-MM-DD` e exibidas como `DD/MM/AAAA` (RNF003), com [src/utils/data.js](src/utils/data.js).
- **Orçamento**: id `AAAA-MM_categoriaId`, o que garante um único orçamento por categoria no mês.
- **Consultas** com `where` em um campo e `orderBy` em outro exigem índice composto. Declare-o em [firestore.indexes.json](firestore.indexes.json).
