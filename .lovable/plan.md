
# User-Submitted Devotionals + Discussion

Turn the Daily Devotional into a community-powered library. Premium/Premium+ users submit devotionals, AI moderates them, and every day one is picked from the library on a fair-rotation basis. Each devotional has its own discussion thread underneath so readers can respond, share insight, and sharpen one another.

## What we're building

### 1. Submission (Premium & Premium+ only)
- New "Write a Devotional" button on the Daily Devotional page (gated by tier)
- Form fields: **Title**, **Scripture reference**, **Reflection**, **Prayer**, optional **Topic tags**
- Author's name + avatar attached automatically from their profile
- Draft auto-save so long writes aren't lost

### 2. Two-stage AI moderation gate
Every submission runs through Lovable AI before publishing:
1. **Doctrinal check** — scripture accuracy, sound exegesis, defends orthodox Christian truth, flags heresy / prosperity gospel / logical fallacies / non-biblical claims
2. **Quality check** — coherent, complete (has all required parts), not spammy or self-promotional, appropriate length

Outcomes:
- **Approved** → enters the library, eligible for daily rotation
- **Needs revision** → sent back with specific AI feedback on what to fix (author can edit and resubmit)
- **Rejected** → clear reason, cannot be resubmitted as-is

### 3. Fair-rotation daily pick
A scheduled job picks one devotional per day using a **least-recently-featured** algorithm:
- Every approved devotional gets a `last_featured_at` timestamp
- Daily job picks the one with the oldest `last_featured_at` (nulls first, so brand-new devotionals surface fast)
- Everyone gets airtime — no one dominates the front page
- If library is empty on a given day, fall back to a Hagion AI-generated devotional (existing flow)

### 4. Library browsing
The Daily Devotional page gets a "Library" tab with:
- **Newest** — recent approvals
- **Topics** — anxiety, hope, forgiveness, prayer, suffering, etc.
- **Scripture** — browse by book/passage
- **Most-read** — engagement-based (reads, saves, amens) but does not affect rotation

### 5. Discussion thread per devotional
Underneath every devotional (both today's featured one and any library entry):
- Comment thread — anyone can reply, quote scripture, encourage
- Nested replies (one level deep, like Prayer Wall)
- Reactions: 🙏 Amen, ❤️ Encouraged, 💡 Insight
- Report button for anything off
- Author is notified when their devotional gets comments
- Comments are also AI-moderated on submit (lighter pass — catches abuse, heresy, spam)

## Technical outline

**New tables:**
- `user_devotionals` — title, scripture_ref, reflection, prayer, tags, author_id, status (pending/approved/needs_revision/rejected), moderation_feedback, last_featured_at, featured_count, read_count, save_count, amen_count
- `devotional_daily_pick` — date, devotional_id (source of truth for "today's" pick, so it's stable per user timezone)
- `user_devotional_comments` — devotional_id, author_id, parent_id, body, reactions
- `user_devotional_comment_reactions` — comment_id, user_id, type
- `user_devotional_reads` / `user_devotional_saves` — engagement tracking

All with RLS: anyone authenticated can read approved devotionals + comments; only the author can edit their own submission (while status is `needs_revision`); only Premium/Premium+ can insert.

**New edge functions:**
- `moderate-user-devotional` — runs the two-stage AI check on submit
- `moderate-devotional-comment` — lighter AI pass on comments
- `pick-daily-devotional` — scheduled daily, applies least-recently-featured logic and writes to `devotional_daily_pick`

**Frontend changes:**
- `DailyDevotional.tsx` — reads from `devotional_daily_pick` for today; falls back to existing Hagion AI generator when library is empty; adds discussion thread section; adds "Write a Devotional" CTA for Premium+
- New `DevotionalLibrary.tsx` page — Newest / Topics / Scripture / Most-read tabs
- New `DevotionalSubmitDialog.tsx` — form + client-side draft save
- New `DevotionalCommentThread.tsx` — reuses the existing prayer comment pattern
- New `MyDevotionals.tsx` (in Profile) — see your submissions, revise the ones needing revision, view stats

## What's not in this plan (open questions to confirm after)
- Landing page split (first-time → Home, returning → Community) — separate change, easy to bolt on after
- Whether pastors/leaders get a visible verified badge on their devotionals — worth doing, but let's decide UX after core ships

Ready to build once you approve.
