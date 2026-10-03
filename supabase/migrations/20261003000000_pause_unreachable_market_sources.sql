-- Preserve historical audit data while pausing sources that have failed every
-- daily production audit since 2026-08-14. Re-enable only after confirming a
-- reachable official endpoint and a compatible verification strategy.
update public.market_sources
set
  enabled = false,
  health_status = 'disabled',
  last_error = 'Paused 2026-10-03 after 50+ consecutive request failures; official endpoint or crawl strategy requires review.',
  updated_at = now()
where id in (
  'amazon-au',
  'aps-data',
  'aps-digital',
  'canberra-clinics',
  'bootstrap-amazon',
  'bootstrap-australian-government',
  'bootstrap-australian-signals-directorate',
  'bootstrap-digital-transformation-agency'
);
