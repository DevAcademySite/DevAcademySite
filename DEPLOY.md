# Publicar a DevAcademy

O Supabase PostgreSQL é o único banco de dados do projeto, tanto localmente
quanto na Vercel. O banco remoto começa vazio; os dados do antigo SQLite local
não são migrados.

## 1. Criar o banco no Supabase

1. Crie um projeto no [Supabase](https://supabase.com/dashboard).
2. No painel do projeto, abra **Connect** e escolha **Transaction pooler**.
   Esse modo é adequado para funções serverless.
3. Copie a URI de conexão PostgreSQL fornecida pelo Supabase e guarde-a em
   local seguro. Não a envie por chat nem a coloque em arquivos do repositório.

As tabelas de usuários, sessões e progresso são criadas automaticamente pela
função quando ela inicia.

## Executar localmente usando o mesmo banco

1. Copie `.env.example` para `.env`.
2. No arquivo `.env`, defina `DATABASE_URL` com a URI do Supabase.
3. Instale o driver PostgreSQL e inicie o servidor:

   ```powershell
   py -m pip install -r requirements.txt
   py server.py
   ```

O arquivo `.env` é ignorado pelo Git. Não use uma URI real no `.env.example`.

## 2. Publicar na Vercel

1. Envie o repositório para uma conta GitHub privada ou pública, conforme sua
   preferência.
2. Na [Vercel](https://vercel.com), importe esse repositório como um novo projeto.
   Mantenha o diretório raiz apontando para a raiz do projeto. A configuração
   define o preset como **Other** para que a Vercel publique a função Python
   em `api/` junto com os arquivos estáticos.
3. Nas configurações do projeto, abra **Environment Variables** e adicione:
   - Nome: `DATABASE_URL`
   - Valor: URI de conexão do Transaction pooler do Supabase.
   - Ambiente: **Production** (e **Preview**, se quiser testar previews).
4. Faça o deploy. O endereço `*.vercel.app` será disponibilizado pela Vercel.
   Após alterar variáveis de ambiente, faça um novo deploy.

## 3. Verificar a publicação

- Abra o endereço da Vercel; a página inicial deve redirecionar para o login.
- Abra `/api/session` no mesmo domínio; sem login, a resposta esperada é
  `{"user": null}`.
- Crie uma conta de teste e confirme que o login e o progresso continuam
  disponíveis após recarregar a página.

## Recuperação de senha por e-mail

O envio de códigos de recuperação requer configuração SMTP no servidor. Para
habilitá-lo, adicione na Vercel as variáveis `DEVACADEMY_SMTP_HOST`,
`DEVACADEMY_SMTP_PORT`, `DEVACADEMY_SMTP_USERNAME`,
`DEVACADEMY_SMTP_PASSWORD` e `DEVACADEMY_SMTP_FROM`, depois faça um novo
deploy. Não use credenciais SMTP no frontend.

## Segurança e dados

- Nunca publique a URI `DATABASE_URL` nem a senha do banco no JavaScript,
  HTML, GitHub público ou mensagens.
- Não crie outro banco local: o desenvolvimento e a produção devem usar o
  mesmo PostgreSQL do Supabase.
- Use uma conta de teste antes de compartilhar o endereço público.
