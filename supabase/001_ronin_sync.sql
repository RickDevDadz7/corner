-- RONIN — sincronização por conta. Rodar UMA vez no SQL Editor do Supabase
-- (mesmo projeto dos outros apps; não mexe nas tabelas deles).
-- Uma linha por aparelho de cada conta. Cada aparelho grava só a própria linha
-- e lê as dos outros aparelhos DA MESMA CONTA para juntar o progresso.

create table if not exists public.ronin_sync (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  device_id  text        not null check (char_length(device_id) between 3 and 64),
  name       text        not null default 'Aparelho' check (char_length(name) <= 60),
  updated_at timestamptz not null default now(),
  data       text        not null check (octet_length(data) < 8000000),
  primary key (user_id, device_id)
);

-- Segurança: ninguém sem login acessa; cada conta só enxerga e altera as próprias linhas.
alter table public.ronin_sync enable row level security;
revoke all on public.ronin_sync from anon;
grant select, insert, update, delete on public.ronin_sync to authenticated;

drop policy if exists "ronin: ler as proprias linhas" on public.ronin_sync;
drop policy if exists "ronin: criar as proprias linhas" on public.ronin_sync;
drop policy if exists "ronin: alterar as proprias linhas" on public.ronin_sync;
drop policy if exists "ronin: apagar as proprias linhas" on public.ronin_sync;

create policy "ronin: ler as proprias linhas" on public.ronin_sync
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "ronin: criar as proprias linhas" on public.ronin_sync
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "ronin: alterar as proprias linhas" on public.ronin_sync
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "ronin: apagar as proprias linhas" on public.ronin_sync
  for delete to authenticated using ((select auth.uid()) = user_id);
