-- ============================================================
-- 클로페이 — Supabase 클라우드 지갑 스키마
-- Supabase 대시보드 > SQL Editor 에 전체 붙여넣고 Run 하면 끝.
-- (여러 번 실행해도 안전하게 작성됨)
--
-- 설계 원칙: 잔액을 브라우저가 직접 수정할 수 없습니다.
--  - 테이블은 "내 것 읽기"만 허용 (RLS)
--  - 모든 잔액 변경은 아래 RPC 함수(서버 코드)로만 가능
--  - 카드 충전 반영(credit_wallet)은 service_role(승인 백엔드) 전용
-- ============================================================

-- ---------- 테이블 ----------
create table if not exists public.wallets (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  balance    bigint not null default 0 check (balance >= 0),
  created_at timestamptz not null default now()
);
create unique index if not exists wallets_email_idx on public.wallets (email);

create table if not exists public.transactions (
  id      bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type    text not null check (type in ('charge','pay','send','receive')),
  name    text not null,
  amount  bigint not null check (amount > 0),
  cat     text,
  at      timestamptz not null default now()
);
create index if not exists transactions_user_at_idx on public.transactions (user_id, at desc);

-- 카드 충전 중복 반영 방지 (주문번호 1회 처리)
create table if not exists public.processed_orders (
  order_id text primary key,
  user_id  uuid not null,
  amount   bigint not null,
  at       timestamptz not null default now()
);

-- ---------- RLS: 내 데이터만 읽기, 쓰기는 함수로만 ----------
alter table public.wallets          enable row level security;
alter table public.transactions     enable row level security;
alter table public.processed_orders enable row level security;

drop policy if exists "own wallet"  on public.wallets;
create policy "own wallet" on public.wallets
  for select using (auth.uid() = user_id);

drop policy if exists "own tx" on public.transactions;
create policy "own tx" on public.transactions
  for select using (auth.uid() = user_id);
-- processed_orders 는 클라이언트 접근 정책 없음 (service_role 전용)

-- ---------- 회원가입 시 지갑 자동 생성 ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.wallets (user_id, email, balance)
  values (new.id, lower(new.email), 0)
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 데모 충전 (체험용 공짜 충전, 한 번에 최대 100만원) ----------
create or replace function public.demo_charge(p_amount bigint)
returns bigint
language plpgsql security definer set search_path = public
as $$
declare v_balance bigint;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다'; end if;
  if p_amount is null or p_amount <= 0 or p_amount > 1000000 then
    raise exception '충전 금액이 올바르지 않습니다';
  end if;
  update wallets set balance = balance + p_amount
   where user_id = auth.uid()
   returning balance into v_balance;
  if not found then raise exception '지갑을 찾을 수 없습니다'; end if;
  insert into transactions (user_id, type, name, amount)
  values (auth.uid(), 'charge', '데모 충전', p_amount);
  return v_balance;
end $$;

-- ---------- 가맹점 결제 ----------
create or replace function public.pay_store(p_store text, p_amount bigint, p_cat text)
returns bigint
language plpgsql security definer set search_path = public
as $$
declare v_balance bigint;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다'; end if;
  if p_amount is null or p_amount <= 0 then raise exception '결제 금액이 올바르지 않습니다'; end if;
  update wallets set balance = balance - p_amount
   where user_id = auth.uid() and balance >= p_amount
   returning balance into v_balance;
  if not found then raise exception '잔액이 부족합니다'; end if;
  insert into transactions (user_id, type, name, amount, cat)
  values (auth.uid(), 'pay', coalesce(nullif(trim(p_store), ''), '가맹점 결제'), p_amount, p_cat);
  return v_balance;
end $$;

-- ---------- 회원 간 송금 (이메일로) ----------
create or replace function public.send_money(p_receiver_email text, p_amount bigint)
returns bigint
language plpgsql security definer set search_path = public
as $$
declare
  v_sender uuid := auth.uid();
  v_receiver uuid;
  v_sender_email text;
  v_balance bigint;
begin
  if v_sender is null then raise exception '로그인이 필요합니다'; end if;
  if p_amount is null or p_amount <= 0 then raise exception '송금 금액이 올바르지 않습니다'; end if;

  select user_id into v_receiver from wallets where email = lower(trim(p_receiver_email));
  if v_receiver is null then raise exception '받는 사람(%)을 찾을 수 없습니다. 가입된 이메일인지 확인해 주세요', p_receiver_email; end if;
  if v_receiver = v_sender then raise exception '나에게는 송금할 수 없습니다'; end if;

  -- 두 지갑을 고정된 순서로 잠가 교착 방지
  perform 1 from wallets where user_id in (v_sender, v_receiver) order by user_id for update;

  update wallets set balance = balance - p_amount
   where user_id = v_sender and balance >= p_amount
   returning balance into v_balance;
  if not found then raise exception '잔액이 부족합니다'; end if;

  update wallets set balance = balance + p_amount where user_id = v_receiver;

  select email into v_sender_email from wallets where user_id = v_sender;
  insert into transactions (user_id, type, name, amount) values
    (v_sender,   'send',    lower(trim(p_receiver_email)) || ' 님에게 송금', p_amount),
    (v_receiver, 'receive', coalesce(v_sender_email, '회원') || ' 님이 보냄',  p_amount);
  return v_balance;
end $$;

-- ---------- 카드 충전 반영 (승인 백엔드 전용 · service_role만 호출 가능) ----------
create or replace function public.credit_wallet(
  p_user_id uuid, p_amount bigint, p_order_id text, p_name text default '카드 충전 (토스페이먼츠)'
)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  if p_amount is null or p_amount <= 0 then raise exception '금액이 올바르지 않습니다'; end if;
  -- 같은 주문번호는 한 번만 반영 (승인 재시도/새로고침 대비)
  insert into processed_orders (order_id, user_id, amount)
  values (p_order_id, p_user_id, p_amount)
  on conflict (order_id) do nothing;
  if not found then return false; end if;

  update wallets set balance = balance + p_amount where user_id = p_user_id;
  if not found then raise exception '지갑을 찾을 수 없습니다: %', p_user_id; end if;
  insert into transactions (user_id, type, name, amount)
  values (p_user_id, 'charge', p_name, p_amount);
  return true;
end $$;

-- 일반 사용자는 credit_wallet 호출 불가 (승인 서버의 service_role 키로만)
revoke execute on function public.credit_wallet(uuid, bigint, text, text) from public, anon, authenticated;

-- 나머지 함수는 로그인 사용자만
revoke execute on function public.demo_charge(bigint) from public, anon;
revoke execute on function public.pay_store(text, bigint, text) from public, anon;
revoke execute on function public.send_money(text, bigint) from public, anon;
grant execute on function public.demo_charge(bigint) to authenticated;
grant execute on function public.pay_store(text, bigint, text) to authenticated;
grant execute on function public.send_money(text, bigint) to authenticated;
