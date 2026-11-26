-- TAIREN — planos (Free / Pro / Premium), teste de 7 dias e cota do Tairen IA.
-- Rodar UMA vez no Supabase: SQL Editor → New query → colar tudo → Run.
-- Pode rodar de novo sem estragar nada (só recria as funções).

-- Plano de cada conta. Só o servidor (Edge Function com a chave secreta) grava aqui;
-- o app só consegue LER a própria linha.
create table if not exists public.tairen_plan (
  user_id     uuid primary key references auth.users on delete cascade,
  plan        text not null default 'free' check (plan in ('free', 'pro', 'premium')),
  trial_until timestamptz,              -- teste grátis de Premium (7 dias a partir da 1ª conversa/abertura)
  paid_until  timestamptz,              -- até quando o plano pago vale (preenchido pela loja depois)
  source      text,                     -- 'trial', 'play', 'apple', 'manual'…
  updated_at  timestamptz not null default now()
);
alter table public.tairen_plan enable row level security;
drop policy if exists "tairen_plan: ler o próprio" on public.tairen_plan;
create policy "tairen_plan: ler o próprio" on public.tairen_plan for select using (auth.uid() = user_id);

-- Quantas perguntas pro Tairen IA cada conta fez por dia.
create table if not exists public.tairen_ai_use (
  user_id uuid not null references auth.users on delete cascade,
  day     date not null,
  n       int  not null default 0,
  primary key (user_id, day)
);
alter table public.tairen_ai_use enable row level security;
drop policy if exists "tairen_ai_use: ler o próprio" on public.tairen_ai_use;
create policy "tairen_ai_use: ler o próprio" on public.tairen_ai_use for select using (auth.uid() = user_id);

-- Pega 1 pergunta da cota, de forma atômica (duas abas ao mesmo tempo não furam o limite).
-- per_day / per_month nulos = sem limite naquele período. Devolve 1 (ok) ou -1 (acabou).
create or replace function public.tairen_take(uid uuid, per_day int, per_month int)
returns int language plpgsql security definer set search_path = public as $$
declare d int; m int;
begin
  perform pg_advisory_xact_lock(hashtext('tairen:' || uid::text));
  select coalesce(sum(n) filter (where day = current_date), 0), coalesce(sum(n), 0)
    into d, m
    from tairen_ai_use
   where user_id = uid and day >= date_trunc('month', current_date)::date;
  if (per_day is not null and d >= per_day) or (per_month is not null and m >= per_month) then
    return -1;
  end if;
  insert into tairen_ai_use (user_id, day, n) values (uid, current_date, 1)
  on conflict (user_id, day) do update set n = tairen_ai_use.n + 1;
  return 1;
end $$;

-- Devolve 1 pergunta quando a IA falhou (a pessoa não paga por erro nosso).
create or replace function public.tairen_give(uid uuid)
returns void language sql security definer set search_path = public as $$
  update tairen_ai_use set n = greatest(n - 1, 0) where user_id = uid and day = current_date;
$$;

-- Ninguém de fora chama essas funções: só a chave secreta do servidor.
revoke all on function public.tairen_take(uuid, int, int) from public, anon, authenticated;
revoke all on function public.tairen_give(uuid) from public, anon, authenticated;
