-- Grant DELETE permissions to authenticated users on conversations table
GRANT DELETE ON public.conversations TO authenticated;

-- Grant DELETE permissions to authenticated users on user_message_usage table
GRANT DELETE ON public.user_message_usage TO authenticated;

-- Create DELETE policy for user_message_usage (policy exists for conversations already)
CREATE POLICY "Users can delete their own usage"
ON public.user_message_usage
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);