# Anima Estudio v2

Nova versão do portfólio de Lucas Miranda, construída para Vercel + Supabase.

## Stack

- Next.js 16 + App Router
- TypeScript
- Supabase Auth (e-mail/senha)
- Supabase Postgres + RLS
- Supabase Storage para capas e galerias
- CSS autoral, sem Tailwind e sem biblioteca visual

## Estrutura

- `/` — home editorial com projetos em destaque
- `/trabalhos` — todos os projetos publicados
- `/trabalhos/[slug]` — página de case
- `/sobre` — posicionamento e expertise
- `/contato` — contato
- `/admin` — painel de projetos
- `/admin/login` — login do painel

## 1. Criar as tabelas no Supabase

Abra **Supabase → SQL Editor** e rode `supabase/schema.sql`.

O script não apaga o banco existente. Ele cria as tabelas/policies específicas deste novo portfólio.

## 2. Criar o usuário do admin

No Supabase, vá em **Authentication → Users** e crie um usuário com e-mail e senha.

Copie o UUID do usuário e rode o `insert` comentado no final de `supabase/schema.sql` para dar o papel `admin`.

## 3. Configurar localmente

Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

O fluxo segue o modelo SSR com cookies recomendado atualmente pelo Supabase para Next.js. O projeto usa `proxy.ts` no Next.js 16 para atualização da sessão. 

## 4. Rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Admin: `http://localhost:3000/admin/login`.

## 5. Vercel

Crie um novo projeto Vercel apontando para este repositório e cadastre as mesmas duas variáveis de ambiente da etapa 3.

O `service_role` não é necessário para este projeto e não deve ser exposto no navegador.

## 6. Migrar do site atual

Esta entrega troca a arquitetura visual e cria um schema novo para os projetos. Como o schema atual do seu Supabase não foi fornecido, **os dados existentes não são copiados automaticamente**.

A migração prática é:

1. Subir este projeto em uma branch nova.
2. Rodar o `schema.sql` no mesmo Supabase atual.
3. Criar seu usuário admin e marcar os projetos antigos/novos conforme necessário.
4. Cadastrar os cases pelo `/admin`.
5. Validar o novo domínio em staging.
6. Depois apontar o domínio da Vercel para a nova versão.

Se seu banco atual já tem uma tabela de projetos, faça um backup antes de qualquer alteração e depois podemos criar um script SQL de migração mapeando campo a campo.

## Conteúdo de um case

Cada projeto aceita:

- título
- slug
- categoria
- ano
- cliente
- seu papel
- introdução
- contexto
- direção
- resultado
- imagem de capa
- galeria de imagens
- vídeo nativo (MP4/WebM/MOV) ou URL embed
- formato principal adaptativo: Auto, 9:16, 3:4, 1:1, 16:9
- créditos
- destaque na home
- publicado / rascunho
- ordem de exibição

## Ícones
- `public/anima-icon.svg` — símbolo Anima em fundo transparente para materiais e aplicações.
- `public/favicon.svg` — versão compacta do símbolo para favicon.

O layout principal já referencia `favicon.svg` e `anima-icon.svg` via metadata do Next.js.
