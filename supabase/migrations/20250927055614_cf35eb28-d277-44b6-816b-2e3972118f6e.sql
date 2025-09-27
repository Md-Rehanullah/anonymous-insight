-- Create user_interactions table to track likes/dislikes per user
CREATE TABLE public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_interactions
CREATE POLICY "Users can view all interactions" 
ON public.user_interactions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own interactions" 
ON public.user_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" 
ON public.user_interactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions" 
ON public.user_interactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_interactions_updated_at
BEFORE UPDATE ON public.user_interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the increment_post_likes function to handle one interaction per user
CREATE OR REPLACE FUNCTION public.increment_post_likes(post_id uuid, user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  existing_interaction TEXT;
BEGIN
  -- Check if user already has an interaction with this post
  SELECT interaction_type INTO existing_interaction
  FROM public.user_interactions 
  WHERE user_interactions.post_id = increment_post_likes.post_id 
  AND user_interactions.user_id = increment_post_likes.user_id;
  
  IF existing_interaction IS NULL THEN
    -- No existing interaction, create new like
    INSERT INTO public.user_interactions (user_id, post_id, interaction_type)
    VALUES (increment_post_likes.user_id, increment_post_likes.post_id, 'like');
    
    UPDATE public.posts 
    SET likes = likes + 1 
    WHERE id = increment_post_likes.post_id;
    
  ELSIF existing_interaction = 'dislike' THEN
    -- Change from dislike to like
    UPDATE public.user_interactions 
    SET interaction_type = 'like', updated_at = now()
    WHERE user_interactions.post_id = increment_post_likes.post_id 
    AND user_interactions.user_id = increment_post_likes.user_id;
    
    UPDATE public.posts 
    SET likes = likes + 1, dislikes = dislikes - 1 
    WHERE id = increment_post_likes.post_id;
    
  -- If existing_interaction = 'like', do nothing (user already liked)
  END IF;
END;
$$;

-- Update the increment_post_dislikes function to handle one interaction per user
CREATE OR REPLACE FUNCTION public.increment_post_dislikes(post_id uuid, user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  existing_interaction TEXT;
BEGIN
  -- Check if user already has an interaction with this post
  SELECT interaction_type INTO existing_interaction
  FROM public.user_interactions 
  WHERE user_interactions.post_id = increment_post_dislikes.post_id 
  AND user_interactions.user_id = increment_post_dislikes.user_id;
  
  IF existing_interaction IS NULL THEN
    -- No existing interaction, create new dislike
    INSERT INTO public.user_interactions (user_id, post_id, interaction_type)
    VALUES (increment_post_dislikes.user_id, increment_post_dislikes.post_id, 'dislike');
    
    UPDATE public.posts 
    SET dislikes = dislikes + 1 
    WHERE id = increment_post_dislikes.post_id;
    
  ELSIF existing_interaction = 'like' THEN
    -- Change from like to dislike
    UPDATE public.user_interactions 
    SET interaction_type = 'dislike', updated_at = now()
    WHERE user_interactions.post_id = increment_post_dislikes.post_id 
    AND user_interactions.user_id = increment_post_dislikes.user_id;
    
    UPDATE public.posts 
    SET dislikes = dislikes + 1, likes = likes - 1 
    WHERE id = increment_post_dislikes.post_id;
    
  -- If existing_interaction = 'dislike', do nothing (user already disliked)
  END IF;
END;
$$;

-- Create function to get user's interaction with a post
CREATE OR REPLACE FUNCTION public.get_user_interaction(post_id uuid, user_id uuid)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT interaction_type 
  FROM public.user_interactions 
  WHERE user_interactions.post_id = get_user_interaction.post_id 
  AND user_interactions.user_id = get_user_interaction.user_id;
$$;