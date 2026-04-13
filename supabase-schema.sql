-- Run this in Supabase SQL Editor before deploying.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'User',
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'emerald',
  language text not null default 'en',
  notifications boolean not null default true,
  privacy_mode boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  mood int not null default 5,
  mood_label text not null default 'neutral',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score int not null check (score between 1 and 10),
  label text,
  note text,
  logged_at timestamptz not null default now()
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Support chat',
  mood_score int,
  mood_label text not null default 'neutral',
  crisis boolean not null default false,
  preview text not null default '',
  message_count int not null default 0,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  mood_score int,
  mood_label text not null default 'neutral',
  crisis boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.journal_entries enable row level security;
alter table public.mood_logs enable row level security;
alter table public.community_posts enable row level security;
alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages enable row level security;

-- profiles
create policy if not exists "profiles_select_authenticated" on public.profiles
  for select to authenticated
  using (true);

create policy if not exists "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

create policy if not exists "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- user_settings
create policy if not exists "settings_select_own" on public.user_settings
  for select to authenticated
  using (auth.uid() = user_id);

create policy if not exists "settings_insert_own" on public.user_settings
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy if not exists "settings_update_own" on public.user_settings
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- journal
create policy if not exists "journal_select_own" on public.journal_entries
  for select to authenticated
  using (auth.uid() = user_id);

create policy if not exists "journal_insert_own" on public.journal_entries
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy if not exists "journal_delete_own" on public.journal_entries
  for delete to authenticated
  using (auth.uid() = user_id);

-- mood logs
create policy if not exists "mood_select_own" on public.mood_logs
  for select to authenticated
  using (auth.uid() = user_id);

create policy if not exists "mood_insert_own" on public.mood_logs
  for insert to authenticated
  with check (auth.uid() = user_id);

-- community posts
create policy if not exists "community_select_authenticated" on public.community_posts
  for select to authenticated
  using (true);

create policy if not exists "community_insert_own" on public.community_posts
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy if not exists "community_delete_own" on public.community_posts
  for delete to authenticated
  using (auth.uid() = user_id);

-- ai chat sessions
create policy if not exists "chat_sessions_select_own" on public.ai_chat_sessions
  for select to authenticated
  using (auth.uid() = user_id);

create policy if not exists "chat_sessions_insert_own" on public.ai_chat_sessions
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy if not exists "chat_sessions_update_own" on public.ai_chat_sessions
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "chat_sessions_delete_own" on public.ai_chat_sessions
  for delete to authenticated
  using (auth.uid() = user_id);

-- ai chat messages
create policy if not exists "chat_messages_select_own" on public.ai_chat_messages
  for select to authenticated
  using (auth.uid() = user_id);

create policy if not exists "chat_messages_insert_own" on public.ai_chat_messages
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy if not exists "chat_messages_delete_own" on public.ai_chat_messages
  for delete to authenticated
  using (auth.uid() = user_id);
