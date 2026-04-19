
-- POSTS (unified feed: post, prayer, testimony)
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  author_name TEXT,
  author_avatar TEXT,
  post_type TEXT NOT NULL DEFAULT 'post' CHECK (post_type IN ('post','prayer','testimony')),
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image','video')),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  pray_count INTEGER NOT NULL DEFAULT 0,
  encourage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Auth users can create posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own posts" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own posts" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- POST INTERACTIONS (likes, prays, encourages, saves)
CREATE TABLE public.post_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like','pray','encourage','save')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, interaction_type)
);
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view interactions" ON public.post_interactions FOR SELECT USING (true);
CREATE POLICY "Auth users add interactions" ON public.post_interactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own interactions" ON public.post_interactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- POST COMMENTS
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  author_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Auth users add comments" ON public.post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON public.post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- REELS
CREATE TABLE public.reels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  author_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reels" ON public.reels FOR SELECT USING (true);
CREATE POLICY "Auth users create reels" ON public.reels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reels" ON public.reels FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own reels" ON public.reels FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_reels_updated BEFORE UPDATE ON public.reels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TEACHINGS
CREATE TABLE public.teachings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teachings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view teachings" ON public.teachings FOR SELECT USING (true);
CREATE POLICY "Auth users create teachings" ON public.teachings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own teachings" ON public.teachings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own teachings" ON public.teachings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_teachings_updated BEFORE UPDATE ON public.teachings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- GROUPS
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Auth users create groups" ON public.groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators update own groups" ON public.groups FOR UPDATE TO authenticated USING (auth.uid() = creator_id);
CREATE POLICY "Creators delete own groups" ON public.groups FOR DELETE TO authenticated USING (auth.uid() = creator_id);
CREATE TRIGGER trg_groups_updated BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view group members" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Users join groups" ON public.group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave groups" ON public.group_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- EVENTS
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  attendee_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Auth users create events" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators update own events" ON public.events FOR UPDATE TO authenticated USING (auth.uid() = creator_id);
CREATE POLICY "Creators delete own events" ON public.events FOR DELETE TO authenticated USING (auth.uid() = creator_id);
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view attendees" ON public.event_attendees FOR SELECT USING (true);
CREATE POLICY "Users join events" ON public.event_attendees FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave events" ON public.event_attendees FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CHURCHES
CREATE TABLE public.churches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  image_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view churches" ON public.churches FOR SELECT USING (true);
CREATE TRIGGER trg_churches_updated BEFORE UPDATE ON public.churches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MESSAGES (uses existing conversations table)
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conversation members view messages" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.user_id = auth.uid() OR c.participant_id = auth.uid())));
CREATE POLICY "Conversation members send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.user_id = auth.uid() OR c.participant_id = auth.uid())));
CREATE POLICY "Senders delete own messages" ON public.messages FOR DELETE TO authenticated USING (auth.uid() = sender_id);

-- INDEXES
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_post_interactions_post ON public.post_interactions(post_id);
CREATE INDEX idx_post_comments_post ON public.post_comments(post_id);
CREATE INDEX idx_messages_conv ON public.messages(conversation_id, created_at);
CREATE INDEX idx_events_date ON public.events(event_date);

-- Counter triggers
CREATE OR REPLACE FUNCTION public.update_post_counts() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.interaction_type = 'like' THEN UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.interaction_type = 'pray' THEN UPDATE posts SET pray_count = pray_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.interaction_type = 'encourage' THEN UPDATE posts SET encourage_count = encourage_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.interaction_type = 'like' THEN UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
    ELSIF OLD.interaction_type = 'pray' THEN UPDATE posts SET pray_count = GREATEST(pray_count - 1, 0) WHERE id = OLD.post_id;
    ELSIF OLD.interaction_type = 'encourage' THEN UPDATE posts SET encourage_count = GREATEST(encourage_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_post_interaction_counts AFTER INSERT OR DELETE ON public.post_interactions FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();

CREATE OR REPLACE FUNCTION public.update_comment_counts() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_comment_counts AFTER INSERT OR DELETE ON public.post_comments FOR EACH ROW EXECUTE FUNCTION public.update_comment_counts();

CREATE OR REPLACE FUNCTION public.update_group_member_count() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN UPDATE groups SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_group_member_count AFTER INSERT OR DELETE ON public.group_members FOR EACH ROW EXECUTE FUNCTION public.update_group_member_count();

CREATE OR REPLACE FUNCTION public.update_event_attendee_count() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN UPDATE events SET attendee_count = attendee_count + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN UPDATE events SET attendee_count = GREATEST(attendee_count - 1, 0) WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_event_attendee_count AFTER INSERT OR DELETE ON public.event_attendees FOR EACH ROW EXECUTE FUNCTION public.update_event_attendee_count();

CREATE OR REPLACE FUNCTION public.update_conversation_last_message() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_conv_last_msg AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();
