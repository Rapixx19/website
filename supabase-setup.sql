-- SENTAVITA DATABASE SETUP
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)

-- ============================================
-- TABLES
-- ============================================

-- CONTENT: editable website text
create table content (
  id text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- TEAM MEMBERS
create table team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  bio text not null,
  linkedin_url text default '',
  initials text not null default '?',
  display_order int default 0,
  is_open_role boolean default false,
  visible boolean default true
);

-- ARTICLES (LinkedIn publications)
create table articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text not null,
  tag text default '',
  linkedin_url text default '',
  published_at date default current_date,
  visible boolean default true,
  display_order int default 0
);

-- POSTS (website journal)
create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  body text not null default '',
  excerpt text default '',
  cover_url text default '',
  post_type text default 'article',
  tags text[] default '{}',
  visible boolean default false,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- POST MEDIA
create table post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  url text not null,
  media_type text not null,
  filename text not null,
  file_size int default 0,
  caption text default '',
  display_order int default 0,
  created_at timestamptz default now()
);

-- LINKEDIN POSTS
create table linkedin_posts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  status text default 'draft',
  linkedin_post_id text,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- CONTACT MESSAGES
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text default '',
  message text not null,
  status text default 'unread',
  admin_notes text default '',
  created_at timestamptz default now()
);

-- USER PROFILES (for role-based access)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role) values (new.id, 'admin');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- INDEXES
-- ============================================
create index posts_slug_idx on posts(slug);
create index posts_published_idx on posts(published_at);
create index post_media_post_idx on post_media(post_id);
create index contact_status_idx on contact_messages(status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table content enable row level security;
alter table team_members enable row level security;
alter table articles enable row level security;
alter table posts enable row level security;
alter table post_media enable row level security;
alter table linkedin_posts enable row level security;
alter table contact_messages enable row level security;
alter table profiles enable row level security;

-- Public read policies
create policy "public read content" on content for select using (true);
create policy "public read team" on team_members for select using (visible = true);
create policy "public read articles" on articles for select using (visible = true);
create policy "public read posts" on posts for select using (visible = true and published_at <= now());
create policy "public read post media" on post_media for select using (exists (select 1 from posts p where p.id = post_id and p.visible = true));
create policy "public submit contact" on contact_messages for insert with check (true);

-- Auth team full access
create policy "auth all content" on content for all using (auth.role() = 'authenticated');
create policy "auth all team" on team_members for all using (auth.role() = 'authenticated');
create policy "auth all articles" on articles for all using (auth.role() = 'authenticated');
create policy "auth all posts" on posts for all using (auth.role() = 'authenticated');
create policy "auth all post media" on post_media for all using (auth.role() = 'authenticated');
create policy "auth all linkedin" on linkedin_posts for all using (auth.role() = 'authenticated');
create policy "auth all contact" on contact_messages for all using (auth.role() = 'authenticated');
create policy "auth read own profile" on profiles for select using (auth.uid() = id);

-- ============================================
-- SEED DATA
-- ============================================
insert into content (id, value) values
  ('home.about.body', 'We are a Swiss company working at the frontier of equine health and performance science. Our work connects horses competing at the highest levels of the sport with the precision technology that can sense what they cannot say.'),
  ('home.about.body2', 'We are early, deliberate, and selective about who we work with. If you are building something that matters — or want to be — we would like to hear from you.'),
  ('home.apply.url', 'https://yourportal.com'),
  ('team.context', 'Sentavita is being built in Zurich, Switzerland, in close collaboration with C.H.C. Horses SA — the stable of Steve Guerdat, 2012 Olympic Champion and current world number one in show jumping. Development is validated on horses including Dynamix de Belheme, 2023 FEI European Champion.')
on conflict (id) do update set value = excluded.value;

insert into team_members (name, role, bio, linkedin_url, initials, display_order) values
  ('Founder', 'Chief Executive', 'Building Sentavita from Zurich. Deep roots in equestrian sport and technology. Working directly with Olympic-level stables including C.H.C. Horses SA and Steve Guerdat''s team.', 'https://linkedin.com', 'F', 1),
  ('Hardware Lead', 'Electronics & Firmware', 'Specialising in low-power embedded systems and clinical-grade sensor integration. Responsible for the full hardware stack: ECG, IMU, temperature sensing, and BLE.', 'https://linkedin.com', 'H', 2),
  ('Software Lead', 'Algorithms & Platform', 'Designs the health intelligence pipeline: HRV analysis, recovery scoring, colic early warning, and the community platform connecting riders, trainers, and stables.', 'https://linkedin.com', 'S', 3);

insert into team_members (name, role, bio, initials, display_order, is_open_role) values
  ('Open Role', 'Multiple Positions', 'We are looking for engineers, textile designers, UI/UX specialists, and equine cardiology researchers. The role can be shaped around the right person.', '+', 4, true);

insert into articles (title, excerpt, tag, linkedin_url, published_at, display_order) values
  ('Why the horse world is about to change the way it thinks about data', 'The equestrian industry has operated for centuries on instinct and observation. A new generation of monitoring technology is about to give those instincts something to measure against.', 'Equine Health', 'https://linkedin.com', '2026-04-01', 1),
  ('The FEI is building the regulatory rails for equine wearables', 'From the USEF rule change in April 2025 to the FEI Equipass digital passport, governing bodies are constructing the infrastructure that will mandate what we are building.', 'Regulation', 'https://linkedin.com', '2026-03-01', 2),
  ('WHOOP changed human sport. The same model can change equestrian sport.', 'A recovery score every morning. A strain score after every session. The science already exists for horses. The product does not — yet.', 'Technology', 'https://linkedin.com', '2026-02-01', 3),
  ('Colic kills 400,000 horses a year. The cardiac signal has been known for decades.', 'Published equine cardiology research shows that HRV deviates from normal parameters hours before visible symptoms appear. Why has no consumer product acted on this?', 'Clinical Science', 'https://linkedin.com', '2026-01-01', 4),
  ('What makes a wearable comfortable enough for a horse to forget it is there', 'Designing a 24/7 sensor for a 580kg animal generating 4-8G at the girth during jumping is not the same problem as designing a fitness watch.', 'Hardware Design', 'https://linkedin.com', '2025-12-01', 5);

-- ============================================
-- STORAGE
-- ============================================
-- Create bucket manually: Supabase Dashboard → Storage → New bucket → "post-media" → Public: YES
-- Then run:
-- create policy "auth upload media" on storage.objects for insert
--   with check (bucket_id = 'post-media' and auth.role() = 'authenticated');
-- create policy "auth delete media" on storage.objects for delete
--   using (bucket_id = 'post-media' and auth.role() = 'authenticated');
-- create policy "public read media" on storage.objects for select
--   using (bucket_id = 'post-media');
