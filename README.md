# Anima Estudio v2

Documento de preparação e publicação do portfólio no Vercel, usando Supabase como banco, autenticação, armazenamento e API.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- Supabase Auth
- Supabase Postgres com RLS
- Supabase Storage
- CSS sem bibliotecas adicionais

## Experiência V2

- Home editorial com seis projetos em destaque.
- Quando ainda não há projetos publicados no Supabase, a home e `/trabalhos` exibem conteúdo demonstrativo para preservar a composição visual; projetos publicados substituem essa demonstração.
- Cases individuais, vídeos nativos ou embeds e apresentação como peça única, galeria ou carrossel.
- Formatos: 9:16, 3:4, 1:1 e 16:9.
- Cursor editorial no desktop, com interação por toque preservada em dispositivos móveis.
- Identidade visual com favicon e ícone próprios.

## Estrutura do site

- `/` — página inicial com destaques
- `/trabalhos` — projetos publicados
- `/trabalhos/[slug]` — página individual do projeto
- `/sobre` — apresentação do estúdio
- `/contato` — formulário de contato
- `/admin/login` — login do painel
- `/admin` — painel administrativo
- `/admin/projetos/novo` — cadastro de projeto
- `/admin/projetos/[id]` — edição de projeto

## Ordenar os trabalhos

No formulário de criação ou edição, use **Posição na lista**: números menores aparecem primeiro em `/trabalhos` e na navegação entre cases. Projetos novos recebem automaticamente uma posição no final da lista; altere o número para mudar a ordem. A home continua priorizando os projetos marcados como destaque.

## Antes de começar

Antes de publicar, é necessário:

1. Criar as tabelas e regras de acesso no Supabase.
2. Criar o usuário do administrador.
3. Confirmar que a autenticação aceita o domínio local e o domínio da Vercel.
4. Configurar as variáveis de ambiente.
5. Validar o projeto localmente.
6. Fazer o deploy apenas após a validação local.

> Não use a chave secreta do Supabase. O projeto utiliza apenas a chave publishable/anônima para o cliente web.

## 1. Criar as tabelas no Supabase

No painel do Supabase:

1. Acesse **SQL Editor**.
2. Abra o arquivo `supabase/schema.sql`.
3. Copie todo o conteúdo para o editor SQL.
4. Execute o script.

O script é seguro para projetos existentes: ele cria somente as tabelas, funções, gatilhos, índices e políticas necessárias para este site. Ele também adiciona o campo `media_mode` aos projetos existentes, com o valor padrão `single`, sem apagar os dados.

Como o schema foi atualizado na V2, execute-o novamente no projeto Supabase existente para habilitar o novo campo de apresentação.

## 2. Criar o bucket e as policies de storage

Depois de executar o schema principal, abra o arquivo `supabase/storage-setup.sql` no **SQL Editor** e execute-o.

Esse script é idempotente: ele cria o bucket `portfolio` como público e mantém as policies de upload, atualização, exclusão e leitura.

O bucket limita cada arquivo a 50 MiB (50 × 1024 × 1024 bytes). Execute novamente `supabase/storage-setup.sql` para aplicar esse limite ao bucket existente. Confirme também em **Storage → Settings** se o limite global de tamanho do projeto Supabase permite arquivos de até 50 MiB.

No painel administrativo, imagens JPG, PNG, WebP e AVIF são convertidas para WebP (até 2560 px) antes do envio. Vídeos MP4, WebM e MOV são convertidos no navegador para MP4 (até 1280 px) e recebem uma imagem de prévia; o arquivo final deve caber em 50 MiB. É possível salvar o projeto enquanto o processamento continua, e o vídeo é associado automaticamente quando o envio termina. Como a compressão roda no navegador, mantenha a aba aberta até a conclusão. O FFmpeg WebAssembly, de aproximadamente 32 MiB, é carregado somente ao iniciar uma compressão de vídeo; capas e imagens de galeria são carregadas sob demanda nas páginas públicas, e vídeos não tocam nem baixam automaticamente na listagem. O comando de desenvolvimento e o build usam Webpack para compatibilidade com o worker do FFmpeg.

**Licença do compressor de vídeo:** `@ffmpeg/core` é distribuído sob GPL-2.0-or-later. Revise as obrigações dessa licença antes de disponibilizar a função em produção; para evitá-la, será necessário substituir o compressor por uma implementação compatível.

### Verificação

Depois da execução, confirme que aparecem:

- As tabelas `public.portfolio_projects` e `public.portfolio_profiles`.
- O bucket `portfolio` no painel **Storage**.
- As policies `portfolio public read`, `portfolio editors upload`, `portfolio editors update` e `portfolio editors delete` no painel **Authentication → Policies** ou **Storage → Policies**.

## 3. Criar o administrador

No painel do Supabase:

1. Acesse **Authentication → Users**.
2. Crie um usuário usando um e-mail e uma senha.
3. Copie o UUID exibido no usuário.
4. Execute o seguinte SQL no **SQL Editor**:

```sql
insert into public.portfolio_profiles (user_id, role)
values ('COLE-AQUI-O-UUID-DO-USUARIO', 'admin')
on conflict (user_id) do update set role = excluded.role;
```

O usuário não precisa ter um papel especial no Supabase Auth. O papel `admin` é definido na tabela `public.portfolio_profiles`.

## 4. Configurar a autenticação

No painel do Supabase, abra **Authentication → URL Configuration**.

Configure **Site URL** com a URL principal do site. Enquanto estiver desenvolvendo, use:

```text
http://localhost:3000
```

Em **Redirect URLs**, permita os endereços locais e os destinos usados após o deploy:

```text
http://localhost:3000/admin
http://localhost:3000/auth/callback
https://SEU-PROJETO.vercel.app/admin
https://SEU-PROJETO.vercel.app/auth/callback
https://SEU-DOMINIO-VERCEL/admin
https://SEU-DOMINIO-VERCEL/auth/callback
```

Após o deploy, atualize **Site URL** para o domínio principal de produção. Adicione endereços Preview à lista de **Redirect URLs** se for testar autenticação nesses deploys.

## 5. Configurar o ambiente local

Na raiz do projeto, copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha o arquivo com as credenciais do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SEU_CLIENT_KEY
```

As duas informações podem ser encontradas em **Supabase → Project Settings → API**.

No ambiente local, é possível executar duas versões diferentes do projeto com diferentes domínios. Não adicione `.env.local` ao Git.

## 6. Instalar e executar localmente

No terminal, execute:

```bash
npm install
npm run dev
```

Abra:

- Site: `http://localhost:3000`
- Login administrativo: `http://localhost:3000/admin/login`

Use o e-mail e a senha criados no Supabase.

## 7. Validar o SQL e as permissões

As seguintes verificações devem ser feitas antes de publicar conteúdo real:

- A tabela `portfolio_projects` existe.
- A tabela `portfolio_profiles` existe.
- O bucket `portfolio` existe.
- O usuário admin possui `role = 'admin'` em `portfolio_profiles`.
- O RLS está habilitado nas tabelas.
- O login consegue acessar `/admin`.
- O admin consegue abrir, criar e editar um projeto.
- O upload de imagem cria uma URL pública.
- Um projeto publicado aparece na página pública.

O deploy inicial pode ser feito antes do cadastro de projetos reais: a home e `/trabalhos` exibem conteúdo demonstrativo até que existam projetos publicados.

### Validação do login

O usuário administrador deve conseguir:

1. Entrar em `/admin/login`.
2. Ser redirecionado para `/admin`.
3. Visualizar a lista de projetos.
4. Criar um projeto.
5. Realizar logout.

## 8. Preparar a Vercel

A Vercel deve receber as mesmas duas variáveis configuradas no ambiente local.

### Variáveis obrigatórias

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Cadastre as variáveis para:

- **Production**
- **Preview**
- **Development**

### Configurações do projeto

Importe o repositório GitHub na Vercel e confirme:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Node.js Version:** 20.x ou superior (o projeto requer `>=20.9.0`).

Mantenha o **Output Directory** padrão detectado pela Vercel para Next.js. A instalação usará o `package-lock.json`; não é necessário sobrescrever o comando padrão. Cadastre as variáveis Supabase nos ambientes **Production**, **Preview** e **Development** conforme necessário.

Não configure uma `service_role` ou secret key neste projeto.

## 9. Configurar o domínio

Depois de importar o projeto:

1. Acesse **Project → Settings → Domains**.
2. Adicione o domínio principal.
3. Copie os registros DNS solicitados pela Vercel.
4. Configure os registros no provedor de domínio.
5. Aguarde a propagação dos registros.
6. Habilite o domínio na Vercel.

Depois, adicione o domínio na lista **Production Domains**.

## 10. Preparar a aplicação de produção

Antes de clicar em **Deploy**, confirme:

- [ ] O SQL do Supabase foi executado.
- [ ] O usuário admin foi criado.
- [ ] O usuário admin recebeu o papel `admin`.
- [ ] O bucket `portfolio` existe e é público.
- [ ] O Site URL do Supabase aponta para o domínio principal de produção.
- [ ] Os Redirect URLs do Supabase incluem localhost e os domínios de produção necessários.
- [ ] Os redirects do Supabase incluem `/admin` e `/auth/callback`.
- [ ] As variáveis da Vercel foram cadastradas.
- [ ] O build local terminou com sucesso.
- [ ] O login administrativo funciona localmente.
- [ ] O domínio da Vercel foi configurado.

Não é necessário cadastrar projetos para o primeiro deploy; a página pública usa conteúdo demonstrativo até a publicação de projetos reais. Antes de divulgar trabalhos reais, valide o cadastro, o upload e a exibição pública da capa seguindo a seção anterior.

## 11. Fazer o deploy

Depois de concluir todos os itens anteriores:

1. Abra o projeto na Vercel.
2. Clique em **Deploy**.
3. Aguarde a conclusão do build.
4. Verifique a URL fornecida pela Vercel.
5. Teste a homepage.
6. Teste `/trabalhos`.
7. Teste o login administrativo.
8. Teste a criação de um projeto.
9. Teste o upload e a imagem pública.
10. Teste o domínio personalizado.

## 12. Depois do deploy

1. Crie os projetos pelo painel administrativo.
2. Publique cada projeto somente quando terminar a edição.
3. Faça backup dos dados do Supabase antes de alterações grandes.
4. Não altere o `service_role` ou expor chaves secretas.
5. Mantenha a Vercel e o Supabase sincronizados com as variáveis de produção.

## Conteúdo de um projeto

Cada projeto aceita:

- Título
- Slug
- Categoria
- Ano
- Cliente
- Papel
- Introdução
- Contexto
- Direção
- Resultado
- Imagem de capa
- Galeria de imagens
- Apresentação: peça única, galeria, carrossel ou vídeo/motion
- Vídeo nativo ou URL embed
- Formato: auto, 9:16, 3:4, 1:1 ou 16:9
- Créditos
- Destaque na home
- Status publicado ou rascunho
- Ordem de exibição

## Ativos

- `public/anima-icon.svg` — ícone principal do Anima Estudio.
- `public/favicon.svg` — versão compacta para favicon.

O layout utiliza esses arquivos por meio das configurações de metadata do Next.js.

## Comandos úteis

```bash
npm install
npm run dev
npm run build
```

O comando `npm run build` é a validação final antes do deploy.
