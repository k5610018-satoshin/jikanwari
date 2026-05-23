-- 時間割アプリ（相乗り：shopping-list の Supabase プロジェクトに追加）
-- 1クラス＝1行。store オブジェクト全体を data(jsonb) に保存する。
-- 先生編集・児童閲覧専用は「クライアント側で編集UIを出し分け」で実現（小学校用途の実用ライン）。

create table if not exists public.timetable (
  class_id   text primary key,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.timetable enable row level security;

-- URLを知っていれば読める（児童の閲覧URL用）
drop policy if exists "timetable_read" on public.timetable;
create policy "timetable_read" on public.timetable
  for select using (true);

-- 書き込みも anon 許可（編集は先生URLのUIからのみ。厳密な鍵制御が要るなら後続migrationで追加）
drop policy if exists "timetable_write" on public.timetable;
create policy "timetable_write" on public.timetable
  for all using (true) with check (true);

-- 他端末への即時反映（Realtime）。既に publication に入っていてもエラーにしない
do $$
begin
  begin
    alter publication supabase_realtime add table public.timetable;
  exception when duplicate_object then null;
  end;
end $$;
