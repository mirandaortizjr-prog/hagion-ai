-- Add user ownership and participant columns to conversations table
ALTER TABLE public.conversations 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
ADD COLUMN participant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN title TEXT,
ADD COLUMN last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for faster queries
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_participant_id ON public.conversations(participant_id);

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Conversations are viewable by everyone" ON public.conversations;

-- Create secure RLS policies

-- SELECT: Users can only view conversations they own or participate in
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  auth.uid() = participant_id
);

-- INSERT: Users can only create conversations for themselves
CREATE POLICY "Users can create their own conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update conversations they own
CREATE POLICY "Users can update their own conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete conversations they own
CREATE POLICY "Users can delete their own conversations"
ON public.conversations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);