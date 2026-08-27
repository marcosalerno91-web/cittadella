-- ============================================================================
-- Prova di isolamento fra agenzie su Postgres.
--
-- Da eseguire nel SQL editor di Supabase, dopo 0001_init.sql.
-- Gira dentro una transazione che alla fine viene annullata: non lascia nulla.
--
-- Stampa una riga NOTICE per ogni prova. Se compare anche un solo FALLISCE,
-- una policy non sta reggendo e non si va in produzione.
-- ============================================================================

begin;

do $$
declare
  v_alfa uuid := gen_random_uuid();
  v_beta uuid := gen_random_uuid();
  v_cliente uuid;
  v_sessione uuid;
  v_conteggio integer;
  v_fallite integer := 0;
begin
  -- ---------------------------------------------------------------- utenti
  insert into auth.users (id, email, instance_id, aud, role)
  values
    (v_alfa, 'alfa@prova.local', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
    (v_beta, 'beta@prova.local', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated');

  -- --------------------------------------------------- Alfa si registra
  perform set_config('request.jwt.claims', json_build_object('sub', v_alfa, 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.registra_advisor('Alfa', 'Agenzia Alfa');

  insert into public.clients (agency_id, advisor_id, etichetta)
  values (public.agency_corrente(), v_alfa, 'Nucleo di Alfa')
  returning id into v_cliente;

  insert into public.sessions (client_id, advisor_id, agency_id)
  values (v_cliente, v_alfa, public.agency_corrente())
  returning id into v_sessione;

  insert into public.finances (session_id) values (v_sessione);
  insert into public.emotions (session_id) values (v_sessione);
  insert into public.fortress_items (session_id, blocco, voce_key)
  values (v_sessione, 'mastio', 'tcm');

  select count(*) into v_conteggio from public.clients;
  if v_conteggio = 1 then
    raise notice 'PASSA   Alfa vede il proprio cliente';
  else
    raise notice 'FALLISCE Alfa vede % clienti invece di 1', v_conteggio;
    v_fallite := v_fallite + 1;
  end if;

  -- --------------------------------------------------- Beta si registra
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_beta, 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.registra_advisor('Beta', 'Agenzia Beta');

  -- --------------------------------------------------- letture di Beta
  select count(*) into v_conteggio from public.clients;
  if v_conteggio = 0 then
    raise notice 'PASSA   Beta non vede nessun cliente di Alfa';
  else
    raise notice 'FALLISCE Beta vede % clienti di Alfa', v_conteggio;
    v_fallite := v_fallite + 1;
  end if;

  select count(*) into v_conteggio from public.sessions;
  if v_conteggio = 0 then
    raise notice 'PASSA   Beta non vede nessuna sessione di Alfa';
  else
    raise notice 'FALLISCE Beta vede % sessioni di Alfa', v_conteggio;
    v_fallite := v_fallite + 1;
  end if;

  select count(*) into v_conteggio from public.family_members;
  if v_conteggio <> 0 then
    raise notice 'FALLISCE Beta vede % membri del nucleo di Alfa', v_conteggio;
    v_fallite := v_fallite + 1;
  end if;

  select count(*) into v_conteggio from public.finances;
  if v_conteggio = 0 then
    raise notice 'PASSA   Beta non vede le finanze di Alfa';
  else
    raise notice 'FALLISCE Beta vede % righe di finanze di Alfa', v_conteggio;
    v_fallite := v_fallite + 1;
  end if;

  select count(*) into v_conteggio from public.fortress_items;
  if v_conteggio = 0 then
    raise notice 'PASSA   Beta non vede le mura di Alfa';
  else
    raise notice 'FALLISCE Beta vede % voci delle mura di Alfa', v_conteggio;
    v_fallite := v_fallite + 1;
  end if;

  select count(*) into v_conteggio from public.emotions;
  if v_conteggio = 0 then
    raise notice 'PASSA   Beta non vede le risposte emotive di Alfa';
  else
    raise notice 'FALLISCE Beta vede % righe di emozioni di Alfa', v_conteggio;
    v_fallite := v_fallite + 1;
  end if;

  -- --------------------------------------------------- scritture di Beta
  begin
    insert into public.family_members (session_id, nome, eta)
    values (v_sessione, 'Intruso', 40);
    raise notice 'FALLISCE Beta ha scritto un membro nella sessione di Alfa';
    v_fallite := v_fallite + 1;
  exception when insufficient_privilege or check_violation then
    raise notice 'PASSA   Beta non puo'' scrivere nel nucleo di Alfa';
  end;

  begin
    update public.fortress_items set stato = 'presente' where session_id = v_sessione;
    get diagnostics v_conteggio = row_count;
    if v_conteggio = 0 then
      raise notice 'PASSA   Beta non tocca le mura di Alfa (0 righe aggiornate)';
    else
      raise notice 'FALLISCE Beta ha aggiornato % voci delle mura di Alfa', v_conteggio;
      v_fallite := v_fallite + 1;
    end if;
  exception when insufficient_privilege then
    raise notice 'PASSA   Beta non puo'' aggiornare le mura di Alfa';
  end;

  begin
    update public.sessions set stato = 'conclusa' where id = v_sessione;
    get diagnostics v_conteggio = row_count;
    if v_conteggio = 0 then
      raise notice 'PASSA   Beta non chiude la sessione di Alfa (0 righe aggiornate)';
    else
      raise notice 'FALLISCE Beta ha chiuso la sessione di Alfa';
      v_fallite := v_fallite + 1;
    end if;
  exception when insufficient_privilege then
    raise notice 'PASSA   Beta non puo'' chiudere la sessione di Alfa';
  end;

  begin
    delete from public.clients where id = v_cliente;
    get diagnostics v_conteggio = row_count;
    if v_conteggio = 0 then
      raise notice 'PASSA   Beta non cancella il cliente di Alfa (0 righe)';
    else
      raise notice 'FALLISCE Beta ha cancellato il cliente di Alfa';
      v_fallite := v_fallite + 1;
    end if;
  exception when insufficient_privilege then
    raise notice 'PASSA   Beta non puo'' cancellare il cliente di Alfa';
  end;

  -- --------------------------------------------------- Beta non si sposta di agenzia
  begin
    update public.advisors set agency_id = (
      select agency_id from public.advisors where id = v_alfa
    ) where id = v_beta;
    raise notice 'FALLISCE Beta si e'' spostato nell''agenzia di Alfa';
    v_fallite := v_fallite + 1;
  exception when insufficient_privilege then
    raise notice 'PASSA   Beta non puo'' cambiarsi agenzia';
  end;

  -- --------------------------------------------------- Alfa e' intatto
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', v_alfa, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into v_conteggio
  from public.fortress_items
  where session_id = v_sessione and stato is null;
  if v_conteggio = 1 then
    raise notice 'PASSA   I dati di Alfa sono rimasti intatti';
  else
    raise notice 'FALLISCE I dati di Alfa sono stati alterati';
    v_fallite := v_fallite + 1;
  end if;

  reset role;

  if v_fallite = 0 then
    raise notice '----------------------------------------';
    raise notice 'ISOLAMENTO OK: nessuna prova fallita.';
  else
    raise exception 'ISOLAMENTO NON GARANTITO: % prove fallite', v_fallite;
  end if;
end $$;

-- niente resta nel database
rollback;
