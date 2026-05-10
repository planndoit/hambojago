create extension if not exists pgcrypto;

create table public.creator_accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint creator_accounts_username_format check (username ~ '^[a-zA-Z0-9_]{3,20}$')
);

create table public.creator_sessions (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_accounts(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creator_accounts(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_title_not_empty check (char_length(trim(title)) > 0),
  constraint events_date_order check (start_date <= end_date)
);

create table public.event_dates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (event_id, date)
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  pin_hash text not null,
  edit_token_hash text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint participants_name_not_empty check (char_length(trim(name)) > 0)
);

create table public.availability (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (participant_id, date),
  foreign key (event_id, date) references public.event_dates(event_id, date) on delete cascade
);

create index events_creator_id_idx on public.events (creator_id);
create index creator_sessions_token_hash_idx on public.creator_sessions (token_hash);
create index creator_sessions_creator_id_idx on public.creator_sessions (creator_id);
create index events_slug_idx on public.events (slug);
create index event_dates_event_id_date_idx on public.event_dates (event_id, date);
create index participants_event_id_idx on public.participants (event_id);
create index availability_event_id_date_idx on public.availability (event_id, date);

alter table public.creator_accounts enable row level security;
alter table public.creator_sessions enable row level security;
alter table public.events enable row level security;
alter table public.event_dates enable row level security;
alter table public.participants enable row level security;
alter table public.availability enable row level security;
