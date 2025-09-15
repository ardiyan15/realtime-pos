create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempt_count int not null default 0,
  created_at timestamptz not null default now()
);

create index on public.otp_codes (user_id);
create index on public.otp_codes (phone);