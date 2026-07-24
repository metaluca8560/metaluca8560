-- ============================================================
-- 디지털 다락방 마을 냥이동 — 주민 명부 스키마
-- Supabase 대시보드 > SQL Editor 에 전체 붙여넣고 Run 하면 끝.
-- (여러 번 실행해도 안전하게 작성됨)
--
-- 설계 원칙: 브라우저는 명부를 읽기만 할 수 있고,
-- 전입(쓰기)은 nyang_move_in RPC로만 가능합니다.
-- 주민번호는 전입 순서대로 원자적으로 발급됩니다.
-- ============================================================

-- ---------- 테이블 ----------
create table if not exists public.nyang_residents (
  id          bigint generated always as identity primary key,
  resident_no int  not null unique,
  name        text not null unique,
  breed       text not null,
  created_at  timestamptz not null default now()
);

-- 일반 주민 6종 + 촌장단 전용 2종 (재실행에도 안전하게 별도 제약으로)
alter table public.nyang_residents drop constraint if exists nyang_residents_breed_check;
alter table public.nyang_residents add constraint nyang_residents_breed_check
  check (breed in ('cheese','tuxedo','mackerel','calico','black','white','russianblue','sphynx'));

-- ---------- RLS: 공개 명부(이름·종류·번호)라 누구나 읽기 가능 ----------
alter table public.nyang_residents enable row level security;

drop policy if exists "public read" on public.nyang_residents;
create policy "public read" on public.nyang_residents
  for select using (true);

-- ---------- 전입신고: 순번 발급 + 1,000명 마감 ----------
create or replace function public.nyang_move_in(p_name text, p_breed text)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_name  text := trim(p_name);
  v_no    int;
  v_breed text;
  v_total int;
begin
  if v_name is null or v_name = '' or length(v_name) > 10 then
    raise exception '이름은 1~10자로 입력해 주세요';
  end if;
  if p_breed not in ('cheese','tuxedo','mackerel','calico','black','white') then
    raise exception '고양이 종류가 올바르지 않습니다';
  end if;

  -- 이미 전입한 이름이면 기존 주민증 재발급 (번호·종류 유지)
  select resident_no, breed into v_no, v_breed from nyang_residents where name = v_name;
  if found then
    select count(*) into v_total from nyang_residents;
    return json_build_object('resident_no', v_no, 'breed', v_breed, 'total', v_total, 'existing', true);
  end if;

  -- 동시 전입에도 번호가 겹치지 않게 잠금 후 발급
  perform pg_advisory_xact_lock(20260717);

  select count(*) into v_total from nyang_residents;
  if v_total >= 1000 then
    raise exception '냥이동 1기 주민 모집이 마감되었습니다 (1,000명)';
  end if;

  select coalesce(max(resident_no), 0) + 1 into v_no from nyang_residents;
  insert into nyang_residents (resident_no, name, breed) values (v_no, v_name, p_breed);

  return json_build_object('resident_no', v_no, 'breed', p_breed, 'total', v_total + 1, 'existing', false);
end $$;

-- ---------- 마을 현황: 인구 + 최근 전입 주민 5명 ----------
create or replace function public.nyang_stats()
returns json
language sql security definer set search_path = public
as $$
  select json_build_object(
    'total',  (select count(*) from nyang_residents),
    'recent', (select coalesce(json_agg(r), '[]'::json) from (
                 select resident_no, name, breed
                 from nyang_residents
                 order by resident_no desc limit 5
               ) r)
  );
$$;

grant execute on function public.nyang_move_in(text, text) to anon, authenticated;
grant execute on function public.nyang_stats() to anon, authenticated;

-- ---------- 명예 주민 (촌장단) ----------
insert into public.nyang_residents (resident_no, name, breed) values
  (1, '푸름이', 'russianblue'),
  (2, '루릭',   'sphynx')
on conflict do nothing;
