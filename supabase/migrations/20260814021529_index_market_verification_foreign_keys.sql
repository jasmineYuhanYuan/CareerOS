create index market_events_run_idx on public.market_verification_events (run_id);
create index market_events_source_idx on public.market_verification_events (source_id);
create index market_events_opportunity_idx on public.market_verification_events (opportunity_id);
