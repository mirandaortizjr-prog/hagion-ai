-- Create user message usage tracking table
CREATE TABLE public.user_message_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_count INTEGER NOT NULL DEFAULT 0,
  last_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_message_usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage
CREATE POLICY "Users can view their own usage"
ON public.user_message_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own usage record
CREATE POLICY "Users can create their own usage"
ON public.user_message_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update their own usage"
ON public.user_message_usage
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to check and increment message count
CREATE OR REPLACE FUNCTION public.check_and_increment_message_count(p_user_id UUID)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_last_reset TIMESTAMP WITH TIME ZONE;
  v_should_reset BOOLEAN;
BEGIN
  -- Get current usage
  SELECT message_count, last_reset_at INTO v_count, v_last_reset
  FROM public.user_message_usage
  WHERE user_id = p_user_id;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.user_message_usage (user_id, message_count, last_reset_at)
    VALUES (p_user_id, 1, now())
    RETURNING message_count INTO v_count;
    
    RETURN QUERY SELECT true, 4;
    RETURN;
  END IF;

  -- Check if 24 hours have passed since last reset
  v_should_reset := (now() - v_last_reset) > interval '24 hours';

  IF v_should_reset THEN
    -- Reset counter
    UPDATE public.user_message_usage
    SET message_count = 1, last_reset_at = now()
    WHERE user_id = p_user_id;
    
    RETURN QUERY SELECT true, 4;
    RETURN;
  END IF;

  -- Check if under limit
  IF v_count < 5 THEN
    -- Increment counter
    UPDATE public.user_message_usage
    SET message_count = message_count + 1
    WHERE user_id = p_user_id;
    
    RETURN QUERY SELECT true, 5 - (v_count + 1);
    RETURN;
  ELSE
    -- Over limit
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;
END;
$$;