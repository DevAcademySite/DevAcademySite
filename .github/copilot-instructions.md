# Instruções do repositório DevAcademy

## Visão geral do projeto

- Esta é uma aplicação web em português, criada com HTML, CSS e JavaScript puros.
- O backend Python usa PostgreSQL do Supabase em todos os ambientes; não mantenha SQLite nem fallback para outro banco.
- O ponto de entrada local é `server.py`. Configure `DATABASE_URL` no arquivo `.env`, execute `py server.py` e abra `http://127.0.0.1:8001/dev.telas/dev.login/login.html`.
- A configuração da Vercel está em `vercel.json`; detalhes de publicação estão em `DEPLOY.md`. Nunca grave `DATABASE_URL` ou credenciais SMTP no repositório.
- Inicie o projeto pelo perfil de depuração `DevAcademy: iniciar servidor` do VS Code; ele executa somente `server.py`.
- `.env` contém configurações locais e é ignorado pelo Git; use `.env.example` como modelo sem segredos.
- O nome da pasta raiz pode conter espaços. As URLs devem usar os caminhos publicados pelo servidor, inclusive a forma com espaços codificados ou direta para diretórios como `telas dos cursos`.

## Estrutura dos arquivos

- `home/`: página inicial, autenticação compartilhada no navegador e página de perfil.
- `dev.telas/dev.login/`: tela de login e recuperação de senha.
- `dev.telas/dev.criarConta/`: criação de conta.
- `Quiz/`: aulas, questionários e prática de código.
- `telas dos cursos/`: catálogo, páginas dos cursos de HTML e backend, PDFs dos módulos e CSS/JavaScript específicos dos cursos.
- `img/` e `dev.telas/dev.img/`: imagens compartilhadas e da área de login.
- `server.py`: autenticação, rotas da API, armazenamento do progresso no PostgreSQL, recuperação por SMTP, lista de arquivos públicos e conteúdo dos cursos.
- `api/index.py`: adaptador de rotas para as funções Python da Vercel.
- `telas dos cursos/readme.md`: referência visual e responsiva das páginas dos cursos.

## Convenções de desenvolvimento

- Preserve a arquitetura atual em HTML, CSS e JavaScript puros, salvo quando o pedido exigir explicitamente uma alteração de framework ou dependências.
- Mantenha os textos exibidos ao usuário em português brasileiro e use `pt-BR` nas páginas HTML.
- Prefira mudanças pequenas e independentes. Não introduza sistema de compilação, empacotador, framework frontend ou pacote Python externo em uma funcionalidade local.
- Utilize `window.DevAcademy.api()` nas chamadas autenticadas à API. Esse objeto é iniciado por `home/auth.js` e usa cookies do mesmo domínio.
- Use `defer` nos scripts HTML e mantenha a ordem de carregamento compatível com os elementos já presentes no DOM.
- Preserve caminhos relativos e espaços codificados em URLs existentes. Adicione novos recursos públicos somente de forma deliberada.
- Mantendo páginas protegidas e comportamentos dependentes da sessão coerentes com `server.py`. Nunca use apenas validação no navegador como substituto da segurança no servidor.
- Preserve acessibilidade em HTML, JavaScript e CSS: use elementos semânticos, rótulos associados, foco visível, textos `alt` úteis e regiões `aria-live` ou de status para feedback dinâmico.
- Preserve o visual escuro existente. Nas páginas dos cursos, siga `telas dos cursos/readme.md`, inclusive as convenções de Poppins, PDFs e a paleta azul-cinza estabelecida.
- Não altere ou duplique silenciosamente perguntas, IDs de módulos, totais de progresso ou regras de pontuação em `server.py`, `Quiz/quiz.teste.js` e nos JavaScript dos cursos.

## Convenções de JavaScript

- Use JavaScript moderno do navegador e APIs DOM de acordo com os padrões dos arquivos existentes.
- Mantenha consultas ao DOM e funções de renderização próximas da página que as utiliza.
- Use `textContent` ou elementos criados pelo DOM para dados que possam conter texto fornecido pelo usuário ou pelo servidor. Evite interpolar dados não confiáveis em `innerHTML`.
- Adicione ouvintes de eventos somente depois que o elemento correspondente estiver disponível no DOM.
- Preserve os comportamentos de visitante e de progresso no servidor nas páginas de quiz e cursos.
- Nas respostas do quiz, fases dos módulos, progresso dos PDFs e prática de código, mantenha o estado do cliente sincronizado com o servidor quando houver uma sessão autenticada.
- Não armazene senhas ou códigos de recuperação no armazenamento do navegador. O `localStorage` pode guardar somente progresso não sensível; para usuários autenticados, o servidor/sessão é a fonte oficial.
- Nas integrações com `postMessage`, valide `event.origin`, a janela ou fonte esperada e o tipo da ação antes de processar o progresso.

## Convenções de CSS

- Siga os padrões já usados na página alvo. Algumas áreas antigas possuem CSS específico por página, em vez de variáveis compartilhadas.
- Preserve o comportamento responsivo. Confira as media queries existentes antes de alterar larguras ou painéis com altura fixa.
- Nas páginas dos cursos, use as cores e variáveis documentadas em `telas dos cursos/readme.md`.
- Mantenha classes de estado e layout legíveis e localizadas. Evite seletores globais amplos que possam afetar outras páginas.

## Convenções do servidor Python

- `server.py` deve continuar compatível com Python 3.10 ou superior e usar Psycopg para conectar ao PostgreSQL em todos os ambientes.
- Inicialize ou migre o esquema PostgreSQL em `initialize()`. Adicione uma migração somente quando um banco existente puder não possuir uma coluna recém-utilizada.
- Mantenha as rotas HTTP específicas e retorne erros JSON por meio de `Handler.reply()`.
- Valide todos os campos POST no servidor e aplique os valores permitidos para trilhas, módulos e perguntas.
- Preserve as verificações de host, origem, tipo de conteúdo e tamanho da requisição.
- Proteja os arquivos publicados por meio da lista explícita `allowed` do servidor. Ao publicar deliberadamente um novo HTML, CSS, JavaScript, imagem ou PDF, adicione a URL exata à lista e valide as condições contra travessia de caminhos.
- Não exponha `.env`, `server.py`, `.git/`, backups ou qualquer outro conteúdo privado do repositório.
- Use consultas parametrizadas com `?`; o adaptador as converte para PostgreSQL. Não concatene dados do usuário em consultas SQL.
- Preserve o hash de senhas, o hash dos tokens de sessão, os cookies HttpOnly/SameSite, o tratamento dos códigos de recuperação e a proteção contra excesso de tentativas.
- A configuração SMTP deve ser obtida pelas variáveis de ambiente `DEVACADEMY_SMTP_*`. Nunca inclua credenciais no código-fonte ou nas instruções.

## Consistência dos cursos e do progresso

- As duas trilhas principais são `web` e `backend`.
- Os módulos web usam IDs de HTML, quiz e conteúdo como `html`; os módulos backend usam `sql`.
- Mantenha os seguintes totais e significados de armazenamento consistentes:
  - Quiz web: 5 perguntas.
  - Quiz SQL backend: 10 perguntas.
  - Curso web: 6 PDFs, mais quiz e prática de código, totalizando 8 atividades.
  - Curso backend: 1 PDF, mais quiz e prática de código, totalizando 3 atividades.
- Ao adicionar ou renomear um módulo ou pergunta, atualize todos os dados relevantes no servidor, rótulos da interface, rotas, dados do quiz e cálculos de progresso.

## Validação

- Inicie `server.py` antes das verificações no navegador ou na API:

  ```powershell
  py server.py
  ```

- Valide em `http://127.0.0.1:8001`, não por meio de outra configuração de inicialização ou servidor estático.
- Use a menor verificação relevante no navegador ou na API:
  - Cadastro, login, logout, persistência da sessão, atualização do perfil e recuperação.
  - Aula, resposta, revisão, fallback local e sincronização de progresso no quiz.
  - Links dos PDFs e navegação entre módulos.
  - Responsividade em computador e celular e navegação pelo teclado.
- Ao alterar sintaxe ou comportamento do servidor Python, execute como mínimo:

  ```powershell
  py -m py_compile server.py
  ```

- Atualmente não há suíte automatizada de testes ou processo de compilação. Não declare que testes passaram sem ter executado um comando. Informe claramente quais verificações foram feitas manualmente.
- Antes de concluir, confira `git --no-pager diff --stat` e `git --no-pager diff --check`. Não confirme nem descarte alterações não relacionadas feitas por outros usuários.
