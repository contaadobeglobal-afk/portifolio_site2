-- Configuração do bucket público e políticas de storage.
-- Execute este script no Supabase SQL Editor após aplicar o schema principal.

begin;

-- Garante que o bucket público exista.
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set
  name = excluded.name,
  public = true;

-- Permite leitura pública das imagens do portfolio.
drop policy if exists "portfolio public read" on storage.objects;
create policy "portfolio public read"
on storage.objects for select
to public
using (bucket_id = 'portfolio');

-- Permite que somente administradores/editoras façam upload.
drop policy if exists "portfolio editors upload" on storage.objects;
create policy "portfolio editors upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'portfolio'
  and public.is_portfolio_editor()
);

-- Permite que somente administradores/editoras atualizem os arquivos.
drop policy if exists "portfolio editors update" on storage.objects;
create policy "portfolio editors update"
on storage.objects for update
to authenticated
using (bucket_id = 'portfolio' and public.is_portfolio_editor())
with check (bucket_id = 'portfolio' and public.is_portfolio_editor());

-- Permite que somente administradores/editoras excluam os arquivos.
drop policy if exists "portfolio editors delete" on storage.objects;
create policy "portfolio editors delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'portfolio' and public.is_portfolio_editor());

commit;

-- Validação rápida. Os resultados esperados são:
-- portfolio_bucket = true
-- portfolio_policies = 4
select
  b.id as bucket_id,
  b.public,
  (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'portfolio%') as portfolio_policies
from storage.buckets b
where b.id = 'portfolio';
