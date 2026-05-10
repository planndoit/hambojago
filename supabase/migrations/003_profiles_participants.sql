alter table public.creator_accounts
  add column if not exists display_name text,
  add column if not exists avatar_url text;

create table if not exists public.participant_accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint participant_accounts_username_format check (username ~ '^[a-zA-Z0-9_]{3,20}$')
);

create table if not exists public.participant_sessions (
  id uuid primary key default gen_random_uuid(),
  participant_account_id uuid not null references public.participant_accounts(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists participant_sessions_token_hash_idx
  on public.participant_sessions (token_hash);

create index if not exists participant_sessions_participant_account_id_idx
  on public.participant_sessions (participant_account_id);

alter table public.participants
  add column if not exists participant_account_id uuid references public.participant_accounts(id) on delete set null;

create unique index if not exists participants_event_participant_account_uidx
  on public.participants (event_id, participant_account_id)
  where participant_account_id is not null;

alter table public.participant_accounts enable row level security;
alter table public.participant_sessions enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read avatars" on storage.objects;

create policy "Public read avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');
