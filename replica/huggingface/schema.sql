-- Hub metadata (Postgres; SQLite-compatible subset for single node). Blobs live in content-addressed storage, not here.
create table accounts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('user','org')),
  name text not null unique,
  email text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table memberships (
  org_id uuid not null references accounts(id) on delete cascade,
  user_id uuid not null references accounts(id) on delete cascade,
  role text not null check (role in ('read','contributor','write','admin')),
  primary key (org_id, user_id)
);
create index on memberships (user_id);
create table tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references accounts(id) on delete cascade,
  hash bytea not null unique,
  role text not null check (role in ('read','write','fineGrained')),
  scopes jsonb not null default '[]',
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
create index on tokens (user_id);
create table repos (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('model','dataset','space','bucket','kernel')),
  owner_id uuid not null references accounts(id) on delete cascade,
  name text not null,
  private boolean not null default false,
  gated text not null default 'false' check (gated in ('false','auto','manual')),
  card jsonb not null default '{}',
  mirror_of text,
  downloads bigint not null default 0,
  likes int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, owner_id, name)
);
create index on repos (kind, updated_at desc);
create index on repos (kind, downloads desc);
create index on repos using gin (card);
create table refs (
  repo_id uuid not null references repos(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('branch','tag','convert','pr')),
  commit_id uuid,
  primary key (repo_id, name)
);
create table commits (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid not null references repos(id) on delete cascade,
  oid char(40) not null,
  parent_oid char(40),
  author_id uuid references accounts(id) on delete set null,
  title text not null,
  message text not null default '',
  created_at timestamptz not null default now(),
  unique (repo_id, oid)
);
create index on commits (repo_id, created_at desc);
create index on commits (author_id);
create table blobs (
  sha256 char(64) primary key,
  size bigint not null,
  storage text not null check (storage in ('inline','lfs','xet')),
  xet_hash text,
  created_at timestamptz not null default now()
);
create table tree_entries (
  commit_id uuid not null references commits(id) on delete cascade,
  path text not null,
  git_oid char(40) not null,
  sha256 char(64) references blobs(sha256) on delete restrict,
  mode text not null default 'file' check (mode in ('file','directory')),
  primary key (commit_id, path)
);
create index on tree_entries (sha256);
create table lfs_uploads (
  sha256 char(64) not null,
  repo_id uuid not null references repos(id) on delete cascade,
  size bigint not null,
  completed boolean not null default false,
  primary key (repo_id, sha256)
);
create table likes (
  user_id uuid not null references accounts(id) on delete cascade,
  repo_id uuid not null references repos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, repo_id)
);
create index on likes (repo_id);
create table discussions (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid not null references repos(id) on delete cascade,
  num int not null,
  author_id uuid references accounts(id) on delete set null,
  title text not null,
  status text not null default 'open' check (status in ('open','closed','merged','draft')),
  is_pr boolean not null default false,
  created_at timestamptz not null default now(),
  unique (repo_id, num)
);
create table comments (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references discussions(id) on delete cascade,
  author_id uuid references accounts(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);
create index on comments (discussion_id, created_at);
create table webhooks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references accounts(id) on delete cascade,
  url text not null,
  secret text,
  watched jsonb not null default '[]',
  disabled boolean not null default false
);
create index on webhooks (owner_id);
create table jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references accounts(id) on delete cascade,
  spec jsonb not null,
  status text not null default 'queued' check (status in ('queued','running','done','failed','cancelled')),
  created_at timestamptz not null default now()
);
create index on jobs (owner_id, created_at desc);
-- Access rules: data-layer checks, one authorisation function per query (owner, membership role, token scope, private flag). No RLS: the service is not tied to Supabase.
