## Decision recap

- **Main Feed stays as-is** (name + structure). We'll only *enrich* it with optional widgets you can toggle off.
- Ship the rest of the One Church model: **Rooms**, **destination-aware composer**, **My Church** layer, **weekly curated features**.

---

## Ideas for the Main Feed (additive only — pick what you want)

These are small modules that drop into the feed without changing its identity:

1. **Verse of the Day card** (top of feed, dismissible) — already have `versesOfTheDay.ts`, just surface it here too.
2. **"Pray for someone" nudge** — rotating card pulling 1 open prayer from the Prayer Wall: *"Maria needs prayer for her son — 🙏 Pray"*. One tap = adds a prayer.
3. **Trending Discussion of the day** — single card linking into Discussions (you already have this on Home; mirror it lightly in the feed).
4. **Friend join card** — "John just joined Hagion — say hi 👋" (drives early connection).
5. **Testimony of the Week** (curated by you) — a pinned story near the top once a week.
6. **Scripture reaction** — let users tap a verse in any post to save it to their Library.
7. **"What God is doing today" prompt** — periodic empty-state composer hint instead of generic "What's on your mind?".
8. **Streak quietly shown** — "Day 7 walking with the Lord" badge on the user's own profile chip.
9. **Reels strip** (horizontal) — top of feed, 5-6 short Christian reels.
10. **Anonymous prayer toggle** — already supported; surface it more prominently in the composer.

Tell me which of these you want and I'll wire them in. I'd recommend **1, 2, 3, 5, 7** as the strongest combo — they add depth without clutter.

---

## What I will build now

### 1. Rooms (replaces "Groups" mental model, keeps same table)
- Add `room_type` to groups: `room` (open topical) vs `church` (verified local) vs `legacy`.
- Seed 12 starter Rooms:
  Marriage & Family · Battling Addiction · New Believers · Apologetics & Hard Questions · Missions & Persecuted Church · Worship & Music · Bible Study · Prayer Warriors · Singles in Christ · Parenting in Faith · Mental Health & Faith · Sala en Español.
- Rooms are open-join, anyone can post inside.
- Users **request** new rooms (no free-for-all creation) — admin approves via a `room_requests` table.
- Groups page becomes two tabs: **Rooms** | **My Church**.

### 2. Destination-aware composer
A single composer with a clear chooser:
**Post to:** `🌍 Main Feed · 🚪 A Room · 🏛️ My Church · 👥 Friends only`
- Selecting "A Room" shows a quick room picker.
- Default = Main Feed (unchanged behavior).
- Posts auto-tag with the right `group_id` / visibility.

### 3. My Church (optional local layer)
- New `churches` table: name, city, state, country, pastor_id, invite_code, verified.
- User links via pastor-issued invite code (`/join-church/:code`).
- Local-only feed at `/community/my-church`.
- Local prayer chain + events scoped to that church.
- Doesn't replace anything — purely additive.

### 4. Weekly curated features
- `featured_content` table: `kind` (verse_of_week / room_of_week / prayer_of_week / testimony_of_week), `ref_id`, `starts_at`, `ends_at`.
- Admin-curated (you set them).
- Surface as a rotating slim card on Home + optional placement in feed.

---

## Technical details

**DB migrations (single migration file):**
```sql
alter table public.groups add column room_type text default 'legacy';
-- backfill existing groups to 'legacy'

create table public.room_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references auth.users(id) on delete cascade,
  name text not null, description text, rationale text,
  status text default 'pending', -- pending/approved/rejected
  created_at timestamptz default now()
);
-- + GRANTs (authenticated select/insert own, service_role all) + RLS

create table public.churches (
  id uuid primary key default gen_random_uuid(),
  name text not null, city text, state text, country text,
  pastor_id uuid references auth.users(id),
  invite_code text unique not null default extensions.encode(extensions.gen_random_bytes(6),'hex'),
  verified boolean default false,
  created_at timestamptz default now()
);
create table public.church_members (
  church_id uuid references public.churches(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member', -- member/leader/pastor
  joined_at timestamptz default now(),
  primary key (church_id, user_id)
);
-- + GRANTs + RLS (members see their church; pastor manages)

create table public.featured_content (
  id uuid primary key default gen_random_uuid(),
  kind text not null,            -- verse_of_week | room_of_week | prayer_of_week | testimony_of_week
  ref_id text,                   -- post id / room id / verse key
  title text, subtitle text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz default now()
);
-- + GRANTs (anon+auth select; service_role all)

-- Seed 12 starter rooms
insert into public.groups (name, description, room_type, ...) values (...);
```

**Frontend files:**
- `src/pages/community/RoomsPage.tsx` (new — replaces Groups tab content; reuses existing group infra)
- `src/pages/community/MyChurchPage.tsx` (new)
- `src/pages/community/JoinChurchPage.tsx` (new, route `/join-church/:code`)
- `src/components/community/PostComposer.tsx` (refactor existing composer into reusable component with `<DestinationChooser />`)
- `src/components/community/FeaturedStrip.tsx` (new — slim weekly-feature card for Home/feed)
- `src/pages/community/GroupsPage.tsx` (turn into tabbed shell: Rooms | My Church)
- Update routes in `src/App.tsx`.

**No changes to:**
- `src/pages/PrayerWall.tsx` (the Main Feed) — except optional widget mounts you approve from the list above.
- Existing post / friendship / messaging logic.

---

## Brief test plan
1. Open community → Rooms tab → see 12 rooms → join one → post → confirm post appears only in that room and **not** in Main Feed.
2. Create test church via SQL (or admin tool) → join via invite code → post → appears only in My Church.
3. New composer: pick each destination → verify post lands in correct surface.
4. Insert a `featured_content` row → reload Home → verify the rotating card shows it.

---

## Tell me before I build
1. From the **Main Feed ideas list above (1–10)**, which do you want? (My pick: 1, 2, 3, 5, 7.)
2. Are the **12 starter rooms** good, or do you want to edit the list?
3. Should you (the founder) be the only one who can **approve room requests + verify churches**, or do you want a small admin role table?