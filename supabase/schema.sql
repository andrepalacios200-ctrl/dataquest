-- DataQuest: Supabase schema + security + RPCs
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null default 'DataQuest learner',
  avatar_url text,
  xp integer not null default 0 check (xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  last_activity_date date,
  preferred_level text check (preferred_level in ('junior','mid-senior','senior')),
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);
create table if not exists public.lessons (
  id text primary key, route_id text not null check (route_id in ('data-science','data-engineering','data-analysis')), level_id text not null check (level_id in ('junior','mid-senior','senior')), title text not null, description text not null default '', type text not null default 'Práctica', duration integer not null default 8, xp integer not null default 20 check (xp >= 0), position integer not null default 1, content jsonb not null default '{}'::jsonb, published boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.lesson_progress (user_id uuid not null references public.profiles(id) on delete cascade, lesson_id text not null references public.lessons(id) on delete cascade, completed_at timestamptz not null default now(), primary key(user_id, lesson_id));
create table if not exists public.quiz_attempts (user_id uuid not null references public.profiles(id) on delete cascade, lesson_id text not null references public.lessons(id) on delete cascade, correct boolean not null, attempted_at timestamptz not null default now(), primary key(user_id, lesson_id));
create index if not exists idx_profiles_xp on public.profiles(xp desc);
create index if not exists idx_lessons_route_level on public.lessons(route_id,level_id,position);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare base_username text; final_username text; n integer:=0;
begin
 base_username:=lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username',split_part(new.email,'@',1)),'[^a-z0-9]+','-','g')); base_username:=trim(both '-' from base_username); if base_username='' then base_username:='learner'; end if; final_username:=base_username;
 while exists(select 1 from public.profiles where username=final_username) loop n:=n+1; final_username:=base_username||'-'||n; end loop;
 insert into public.profiles(id,username,full_name,preferred_level) values(new.id,final_username,coalesce(new.raw_user_meta_data->>'full_name','DataQuest learner'),'mid-senior'); return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.complete_lesson(p_lesson_id text,p_xp integer) returns table(xp integer,streak integer,last_activity_date date) language plpgsql security definer set search_path=public as $$
declare current_xp integer; current_streak integer; last_date date; new_streak integer;
begin
 if not exists(select 1 from public.lessons where id=p_lesson_id and published=true) then raise exception 'Lesson not found'; end if;
 select p.xp,p.streak,p.last_activity_date into current_xp,current_streak,last_date from public.profiles p where p.id=auth.uid() for update;
 if exists(select 1 from public.lesson_progress where user_id=auth.uid() and lesson_id=p_lesson_id) then return query select current_xp,current_streak,last_date; return; end if;
 if last_date=current_date then new_streak:=greatest(current_streak,1); elsif last_date=current_date-1 then new_streak:=current_streak+1; else new_streak:=1; end if;
 insert into public.lesson_progress(user_id,lesson_id) values(auth.uid(),p_lesson_id);
 update public.profiles set xp=current_xp+greatest(p_xp,0),streak=new_streak,last_activity_date=current_date where id=auth.uid();
 return query select current_xp+greatest(p_xp,0),new_streak,current_date;
end; $$;
grant execute on function public.complete_lesson(text,integer) to authenticated;

create or replace function public.record_quiz_attempt(p_lesson_id text,p_correct boolean) returns table(xp integer) language plpgsql security definer set search_path=public as $$
declare current_xp integer; bonus integer:=case when p_correct then 5 else 0 end;
begin
 select p.xp into current_xp from public.profiles p where p.id=auth.uid() for update;
 if exists(select 1 from public.quiz_attempts where user_id=auth.uid() and lesson_id=p_lesson_id) then return query select current_xp; return; end if;
 insert into public.quiz_attempts(user_id,lesson_id,correct) values(auth.uid(),p_lesson_id,p_correct); update public.profiles set xp=current_xp+bonus where id=auth.uid(); return query select current_xp+bonus;
end; $$;
grant execute on function public.record_quiz_attempt(text,boolean) to authenticated;

create or replace function public.reset_my_progress() returns void language plpgsql security definer set search_path=public as $$ begin delete from public.lesson_progress where user_id=auth.uid(); delete from public.quiz_attempts where user_id=auth.uid(); update public.profiles set xp=0,streak=0,last_activity_date=null where id=auth.uid(); end; $$;
grant execute on function public.reset_my_progress() to authenticated;

alter table public.profiles enable row level security; alter table public.lessons enable row level security; alter table public.lesson_progress enable row level security; alter table public.quiz_attempts enable row level security;
drop policy if exists profiles_select on public.profiles; create policy profiles_select on public.profiles for select using(true);
drop policy if exists profiles_update_self on public.profiles; create policy profiles_update_self on public.profiles for update using(auth.uid()=id) with check(auth.uid()=id);
drop policy if exists lessons_select_published on public.lessons; create policy lessons_select_published on public.lessons for select using(published=true or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists lessons_admin_insert on public.lessons; create policy lessons_admin_insert on public.lessons for insert with check(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists lessons_admin_update on public.lessons; create policy lessons_admin_update on public.lessons for update using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists lessons_admin_delete on public.lessons; create policy lessons_admin_delete on public.lessons for delete using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists progress_self on public.lesson_progress; create policy progress_self on public.lesson_progress for select using(auth.uid()=user_id);
drop policy if exists quiz_self on public.quiz_attempts; create policy quiz_self on public.quiz_attempts for select using(auth.uid()=user_id);
-- After your first account is created, promote it with:
-- update public.profiles set role='admin' where username='your-username';
