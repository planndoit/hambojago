alter table public.events
  add column if not exists vote_deadline timestamptz null;

comment on column public.events.vote_deadline is 'Optional KST-based deadline after which voting is closed.';
