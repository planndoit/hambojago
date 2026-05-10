create table if not exists public.creator_accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint creator_accounts_username_format check (username ~ '^[a-zA-Z0-9_]{3,20}$')
);

create table if not exists public.creator_sessions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_accounts(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists creator_sessions_token_hash_idx
  on public.creator_sessions (token_hash);

create index if not exists creator_sessions_creator_id_idx
  on public.creator_sessions (creator_id);

drop policy if exists "Creators can read own events" on public.events;
drop policy if exists "Creators can create own events" on public.events;
drop policy if exists "Creators can update own events" on public.events;

alter table public.creator_accounts enable row level security;
alter table public.creator_sessions enable row level security;

alter table public.events
  drop constraint if exists events_creator_id_fkey;

alter table public.events
  add constraint events_creator_id_fkey
  foreign key (creator_id)
  references public.creator_accounts(id)
  on delete cascade
  not valid;
