-- LudoNest — sample venues (Stage 1).
-- Fixed UUIDs so the player UI keeps its demo content and bookings have real
-- venue_id targets. No owner assigned — a manager can later claim one.
-- Safe to re-run.

-- Helper: expand one day's {closed,open,close} into a full 7-day WeeklyHours.
create or replace function public._week(d jsonb)
returns jsonb language sql immutable as
$$ select jsonb_build_object(
     'mon', d, 'tue', d, 'wed', d, 'thu', d, 'fri', d, 'sat', d, 'sun', d) $$;

insert into public.venues
  (id, name, city, address, hours, lat, lng, total_tables, genres, rating, description)
values
  ('a0000000-0000-4000-8000-000000000001', 'Il Dado Nero', 'Milano', 'Via dei Giochi 12',
   public._week('{"closed":false,"open":"16:00","close":"00:00"}'), 45.4668, 9.1905, 10,
   array['Strategici','Cooperativi','Famiglia'], 5.2,
   'Locale storico nel cuore della città con oltre 500 giochi in libreria e un angolo dedicato ai cooperativi più recenti.'),
  ('a0000000-0000-4000-8000-000000000002', 'Meeple House', 'Milano', 'Corso Ludico 45',
   public._week('{"closed":false,"open":"15:00","close":"23:00"}'), 45.4780, 9.2270, 8,
   array['Party Game','Famiglia'], 4.7,
   'Atmosfera informale, tornei settimanali di party game e drink a tema.'),
  ('a0000000-0000-4000-8000-000000000003', 'Tavolo Rotondo', 'Milano', 'Piazza Torneo 3',
   public._week('{"closed":false,"open":"18:00","close":"02:00"}'), 45.4590, 9.1780, 12,
   array['GDR','Wargame'], 5.8,
   'Il punto di riferimento per giocatori di ruolo e wargamer, con tavoli prenotabili per campagne lunghe.'),
  ('a0000000-0000-4000-8000-000000000004', 'La Locanda dei Giochi', 'Milano', 'Via del Ponte 88',
   public._week('{"closed":false,"open":"14:00","close":"22:00"}'), 45.4850, 9.2050, 6,
   array['Famiglia','Carte'], 4.3,
   'Un salotto accogliente, perfetto per famiglie e principianti, con staff sempre pronto a spiegare le regole.'),
  ('a0000000-0000-4000-8000-000000000005', 'Zona Franca', 'Milano', 'Via Underground 7',
   public._week('{"closed":false,"open":"17:00","close":"01:00"}'), 45.4520, 9.2010, 9,
   array['Strategici','GDR','Carte'], 5.0,
   'Spazio underground con eventi a tema e community molto attiva sui giochi di carte competitivi.'),
  ('a0000000-0000-4000-8000-000000000006', 'Scacco Matto Café', 'Milano', 'Largo Regina 21',
   public._week('{"closed":false,"open":"09:00","close":"20:00"}'), 45.4720, 9.1650, 7,
   array['Strategici','Famiglia'], 4.9,
   'Caffetteria di giorno, ludoteca nel weekend: scacchi, giochi astratti e ottimo caffè.')
on conflict (id) do nothing;

drop function public._week(jsonb);
