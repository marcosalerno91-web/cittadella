-- ============================================================================
-- Cittadella — schema iniziale
--
-- Idempotente: si puo' rieseguire su un database gia' migrato senza effetti.
-- Multi-tenant: agency -> advisor -> client -> session.
--
-- Regola di isolamento applicata da ogni policy:
--   un advisor vede esclusivamente le righe della propria agency_id
--   e, per clienti e sessioni, solo quelle di cui e' lui l'advisor.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- tabelle

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.advisors (
  id uuid primary key references auth.users (id) on delete cascade,
  agency_id uuid not null references public.agencies (id) on delete cascade,
  nome text not null,
  email text not null,
  ruolo text not null default 'advisor',
  created_at timestamptz not null default now()
);

alter table public.advisors drop constraint if exists advisors_ruolo_check;
alter table public.advisors
  add constraint advisors_ruolo_check check (ruolo in ('advisor', 'titolare'));

create index if not exists advisors_agency_idx on public.advisors (agency_id);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id) on delete cascade,
  advisor_id uuid not null references public.advisors (id) on delete cascade,
  etichetta text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists clients_agency_idx on public.clients (agency_id);
create index if not exists clients_advisor_idx on public.clients (advisor_id);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  advisor_id uuid not null references public.advisors (id) on delete cascade,
  agency_id uuid not null references public.agencies (id) on delete cascade,
  stato text not null default 'bozza',
  fase_corrente text not null default 'nucleo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  conclusa_at timestamptz
);

alter table public.sessions drop constraint if exists sessions_stato_check;
alter table public.sessions
  add constraint sessions_stato_check check (stato in ('bozza', 'in_corso', 'conclusa'));

alter table public.sessions drop constraint if exists sessions_fase_check;
alter table public.sessions
  add constraint sessions_fase_check check (
    fase_corrente in (
      'nucleo', 'ciclo_vita', 'finanze', 'fortezza',
      'situazione_oggi', 'cittadella_completa', 'desiderato', 'chiusura'
    )
  );

create index if not exists sessions_client_idx on public.sessions (client_id);
create index if not exists sessions_advisor_idx on public.sessions (advisor_id);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  nome text not null,
  eta integer not null default 0,
  professione_key text not null default 'casual',
  professione_libera text,
  ruolo_famiglia text not null default 'altro',
  avatar_seed jsonb not null default '{}'::jsonb,
  ordine integer not null default 0
);

alter table public.family_members drop constraint if exists family_members_eta_check;
alter table public.family_members
  add constraint family_members_eta_check check (eta >= 0 and eta <= 120);

create index if not exists family_members_session_idx on public.family_members (session_id);

create table if not exists public.finances (
  session_id uuid primary key references public.sessions (id) on delete cascade,
  redditi jsonb not null default '[]'::jsonb,
  rendite jsonb not null default '{}'::jsonb,
  uscite jsonb not null default '{}'::jsonb,
  crm_mensile numeric not null default 0,
  crm_annuale numeric not null default 0,
  crm_percentuale numeric not null default 0
);

create table if not exists public.fortress_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  blocco text not null,
  voce_key text not null,
  stato text,
  nota text,
  unique (session_id, voce_key)
);

alter table public.fortress_items drop constraint if exists fortress_items_blocco_check;
alter table public.fortress_items
  add constraint fortress_items_blocco_check
  check (blocco in ('mastio', 'salute', 'risparmio', 'perimetro'));

alter table public.fortress_items drop constraint if exists fortress_items_stato_check;
alter table public.fortress_items
  add constraint fortress_items_stato_check
  check (stato is null or stato in ('presente', 'assente', 'non_so'));

create index if not exists fortress_items_session_idx on public.fortress_items (session_id);

create table if not exists public.emotions (
  session_id uuid primary key references public.sessions (id) on delete cascade,
  sentire_attuale text not null default '',
  sentire_desiderato text not null default '',
  emozioni_scelte text[] not null default '{}',
  emozioni_desiderate text[] not null default '{}',
  priorita_dichiarate text[] not null default '{}'
);

-- ---------------------------------------------------------------- helper

-- SECURITY DEFINER: legge advisors ignorando la RLS, cosi' le policy che la
-- usano non ricadono su se stesse.
create or replace function public.agency_corrente()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select agency_id from public.advisors where id = auth.uid()
$$;

revoke all on function public.agency_corrente() from public;
grant execute on function public.agency_corrente() to authenticated;

-- true se la sessione indicata appartiene all'advisor collegato
create or replace function public.sessione_mia(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.sessions s
    where s.id = p_session_id
      and s.advisor_id = auth.uid()
      and s.agency_id = public.agency_corrente()
  )
$$;

revoke all on function public.sessione_mia(uuid) from public;
grant execute on function public.sessione_mia(uuid) to authenticated;

-- tiene aggiornato sessions.updated_at
create or replace function public.tocca_sessione()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sessions_tocca on public.sessions;
create trigger sessions_tocca
  before update on public.sessions
  for each row execute function public.tocca_sessione();

-- ---------------------------------------------------------------- RLS

alter table public.agencies enable row level security;
alter table public.advisors enable row level security;
alter table public.clients enable row level security;
alter table public.sessions enable row level security;
alter table public.family_members enable row level security;
alter table public.finances enable row level security;
alter table public.fortress_items enable row level security;
alter table public.emotions enable row level security;

-- nessuna policy permissiva "for all" con using(true) da nessuna parte.

drop policy if exists agencies_select on public.agencies;
create policy agencies_select on public.agencies
  for select to authenticated
  using (id = public.agency_corrente());

drop policy if exists advisors_select on public.advisors;
create policy advisors_select on public.advisors
  for select to authenticated
  using (agency_id = public.agency_corrente());

-- Nessuna policy di INSERT/UPDATE su advisors: la riga advisor e la sua agenzia
-- nascono solo attraverso public.registra_advisor(), che controlla auth.uid() e
-- non permette di scegliersi un'agenzia altrui.
drop policy if exists advisors_insert_self on public.advisors;
drop policy if exists advisors_update_self on public.advisors;

drop policy if exists clients_rw on public.clients;
create policy clients_rw on public.clients
  for all to authenticated
  using (agency_id = public.agency_corrente() and advisor_id = auth.uid())
  with check (agency_id = public.agency_corrente() and advisor_id = auth.uid());

drop policy if exists sessions_rw on public.sessions;
create policy sessions_rw on public.sessions
  for all to authenticated
  using (agency_id = public.agency_corrente() and advisor_id = auth.uid())
  with check (agency_id = public.agency_corrente() and advisor_id = auth.uid());

drop policy if exists family_members_rw on public.family_members;
create policy family_members_rw on public.family_members
  for all to authenticated
  using (public.sessione_mia(session_id))
  with check (public.sessione_mia(session_id));

drop policy if exists finances_rw on public.finances;
create policy finances_rw on public.finances
  for all to authenticated
  using (public.sessione_mia(session_id))
  with check (public.sessione_mia(session_id));

drop policy if exists fortress_items_rw on public.fortress_items;
create policy fortress_items_rw on public.fortress_items
  for all to authenticated
  using (public.sessione_mia(session_id))
  with check (public.sessione_mia(session_id));

drop policy if exists emotions_rw on public.emotions;
create policy emotions_rw on public.emotions
  for all to authenticated
  using (public.sessione_mia(session_id))
  with check (public.sessione_mia(session_id));

-- ---------------------------------------------------------------- registrazione

-- Crea agenzia + advisor per l'utente collegato. Idempotente: se l'advisor
-- esiste gia', restituisce la sua agenzia senza creare nulla.
-- SECURITY DEFINER perche' deve scrivere su tabelle che l'utente non puo'
-- toccare direttamente; l'unico id che puo' creare e' il proprio.
create or replace function public.registra_advisor(p_nome text, p_agenzia text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_agency uuid;
begin
  if v_uid is null then
    raise exception 'Nessun utente collegato';
  end if;

  select agency_id into v_agency from public.advisors where id = v_uid;
  if v_agency is not null then
    return v_agency;
  end if;

  select email into v_email from auth.users where id = v_uid;

  insert into public.agencies (nome)
  values (coalesce(nullif(btrim(coalesce(p_agenzia, '')), ''), 'La mia agenzia'))
  returning id into v_agency;

  insert into public.advisors (id, agency_id, nome, email, ruolo)
  values (
    v_uid,
    v_agency,
    coalesce(nullif(btrim(p_nome), ''), split_part(v_email, '@', 1)),
    v_email,
    'titolare'
  );

  return v_agency;
end;
$$;

revoke all on function public.registra_advisor(text, text) from public;
grant execute on function public.registra_advisor(text, text) to authenticated;

-- ---------------------------------------------------------------- guardia

-- Espone lo stato di protezione delle tabelle del modello.
--
-- Serve alla guardia che gira all'avvio dell'applicazione: se qualcuno collega
-- le credenziali Supabase senza aver eseguito questa migration, l'applicazione
-- deve fermarsi invece di girare senza isolamento fra agenzie.
--
-- pg_catalog non e' esposto da PostgREST, quindi la lettura passa da qui.
-- Non rivela dati: solo nomi di tabelle e di policy.
create or replace function public.stato_protezione()
returns table (tabella text, rls_attiva boolean, policy_presenti text[])
language sql
stable
security definer
set search_path = public, pg_catalog, pg_temp
as $$
  select
    c.relname::text,
    c.relrowsecurity,
    coalesce(
      array_agg(p.polname::text order by p.polname) filter (where p.polname is not null),
      '{}'::text[]
    )
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  left join pg_policy p on p.polrelid = c.oid
  where n.nspname = 'public'
    and c.relkind = 'r'
    and c.relname in (
      'agencies', 'advisors', 'clients', 'sessions',
      'family_members', 'finances', 'fortress_items', 'emotions'
    )
  group by c.relname, c.relrowsecurity
$$;

revoke all on function public.stato_protezione() from public;
-- anche ad anon: la guardia deve poter parlare prima che qualcuno acceda
grant execute on function public.stato_protezione() to anon, authenticated;

-- l'accesso anonimo non tocca nulla
revoke all on all tables in schema public from anon;
