-- ============================================================================
-- Cittadella — la cittadella desiderata
--
-- Idempotente: si puo' rieseguire su un database gia' migrato senza effetti.
--
-- Ogni voce delle mura porta ora due informazioni che non vanno mai confuse:
--   stato       cosa la famiglia ha oggi   (presente / assente / non_so)
--   desiderata  cosa la famiglia vuole     (booleano)
--
-- La cittadella desiderata e' la somma di cio' che e' presente piu' cio' che
-- e' scelto.
-- ============================================================================

alter table public.fortress_items
  add column if not exists desiderata boolean not null default false;

create index if not exists fortress_items_desiderate_idx
  on public.fortress_items (session_id)
  where desiderata;

-- ---------------------------------------------------------------- travaso

-- Fino alla v1.1 la scelta del cliente stava in emotions.priorita_dichiarate,
-- un elenco di chiavi. Era la stessa cosa detta peggio: una lista slegata
-- dalle voci a cui si riferiva. Qui viene travasata una volta sola.
--
-- La colonna di partenza NON viene eliminata: cancellare dati e' definitivo e
-- non e' questo il posto per farlo. Resta li', inutilizzata.
do $$
declare
  v_travasate integer;
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'emotions'
      and column_name = 'priorita_dichiarate'
  ) then
    update public.fortress_items f
    set desiderata = true
    from public.emotions e
    where e.session_id = f.session_id
      and f.voce_key = any (e.priorita_dichiarate)
      and f.desiderata is not true;

    get diagnostics v_travasate = row_count;
    raise notice 'Voci desiderate travasate da priorita_dichiarate: %', v_travasate;
  end if;
end $$;

comment on column public.fortress_items.desiderata is
  'Il cliente vuole questa costruzione nella propria cittadella. Indipendente da stato.';

comment on column public.emotions.priorita_dichiarate is
  'Superata dalla v1.2: la scelta del cliente vive in fortress_items.desiderata. Conservata, non piu'' scritta.';
