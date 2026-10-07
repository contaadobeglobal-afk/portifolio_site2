-- Anima Estudio v2 — schema + RLS + Storage
-- Seguro para rodar em um projeto Supabase existente: cria apenas as tabelas/policies deste novo portfólio.

create extension if not exists pgcrypto;

create table if not exists public.portfolio_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'Direção de arte',
  format text not null default 'auto' check (format in ('auto','9:16','3:4','1:1','16:9')),
  media_mode text not null default 'single' check (media_mode in ('single','gallery','carousel','video')),
  year int,
  client text,
  role text,
  intro text,
  challenge text,
  direction text,
  result text,
  cover_url text not null,
  gallery_urls text[] not null default '{}',
  video_url text,
  credits text,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_projects add column if not exists format text not null default 'auto';
alter table public.portfolio_projects add column if not exists media_mode text not null default 'single';
alter table public.portfolio_projects drop constraint if exists portfolio_projects_format_check;
alter table public.portfolio_projects add constraint portfolio_projects_format_check check (format in ('auto','9:16','3:4','1:1','16:9'));
alter table public.portfolio_projects drop constraint if exists portfolio_projects_media_mode_check;
alter table public.portfolio_projects add constraint portfolio_projects_media_mode_check check (media_mode in ('single','gallery','carousel','video'));

create index if not exists portfolio_projects_public_idx on public.portfolio_projects (published, featured, sort_order);

create or replace function public.set_portfolio_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolio_projects_updated_at on public.portfolio_projects;
create trigger portfolio_projects_updated_at
before update on public.portfolio_projects
for each row execute function public.set_portfolio_updated_at();

create or replace function public.is_portfolio_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.portfolio_profiles
    where user_id = auth.uid()
      and role in ('admin', 'editor')
  );
$$;

revoke all on function public.is_portfolio_editor() from public;
grant execute on function public.is_portfolio_editor() to authenticated;

grant select on public.portfolio_projects to anon, authenticated;
grant insert, update, delete on public.portfolio_projects to authenticated;
grant select on public.portfolio_profiles to authenticated;

alter table public.portfolio_projects enable row level security;
alter table public.portfolio_profiles enable row level security;

drop policy if exists "public can view published projects" on public.portfolio_projects;
create policy "public can view published projects"
on public.portfolio_projects for select
to anon, authenticated
using (published = true or public.is_portfolio_editor());

drop policy if exists "editors can insert projects" on public.portfolio_projects;
create policy "editors can insert projects"
on public.portfolio_projects for insert
to authenticated
with check (public.is_portfolio_editor());

drop policy if exists "editors can update projects" on public.portfolio_projects;
create policy "editors can update projects"
on public.portfolio_projects for update
to authenticated
using (public.is_portfolio_editor())
with check (public.is_portfolio_editor());

drop policy if exists "editors can delete projects" on public.portfolio_projects;
create policy "editors can delete projects"
on public.portfolio_projects for delete
to authenticated
using (public.is_portfolio_editor());

drop policy if exists "editors can read own profile" on public.portfolio_profiles;
create policy "editors can read own profile"
on public.portfolio_profiles for select
to authenticated
using (user_id = auth.uid());

-- Storage bucket. O bucket é público para as imagens do portfólio.
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = true;

 drop policy if exists "portfolio public read" on storage.objects;
create policy "portfolio public read"
on storage.objects for select
to public
using (bucket_id = 'portfolio');

drop policy if exists "portfolio editors upload" on storage.objects;
create policy "portfolio editors upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'portfolio' and public.is_portfolio_editor());

drop policy if exists "portfolio editors update" on storage.objects;
create policy "portfolio editors update"
on storage.objects for update
to authenticated
using (bucket_id = 'portfolio' and public.is_portfolio_editor())
with check (bucket_id = 'portfolio' and public.is_portfolio_editor());

drop policy if exists "portfolio editors delete" on storage.objects;
create policy "portfolio editors delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'portfolio' and public.is_portfolio_editor());

-- Depois de criar um usuário em Auth > Users, execute:
-- insert into public.portfolio_profiles (user_id, role)
-- values ('COLE-O-UUID-DO-USUARIO', 'admin')
-- on conflict (user_id) do update set role = excluded.role;
