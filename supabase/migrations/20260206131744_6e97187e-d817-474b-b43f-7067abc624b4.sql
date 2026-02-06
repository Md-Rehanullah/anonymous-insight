
-- 1. Fix user_interactions: restrict SELECT to own interactions only
DROP POLICY IF EXISTS "Users can view all interactions" ON public.user_interactions;
CREATE POLICY "Users can view their own interactions"
ON public.user_interactions
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Create answer_interactions table for tracking answer votes
CREATE TABLE public.answer_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, answer_id)
);

ALTER TABLE public.answer_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own answer interactions"
ON public.answer_interactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own answer interactions"
ON public.answer_interactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answer interactions"
ON public.answer_interactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own answer interactions"
ON public.answer_interactions FOR DELETE
USING (auth.uid() = user_id);

-- 3. Replace increment_answer_likes with authorized version
CREATE OR REPLACE FUNCTION public.increment_answer_likes(answer_id uuid, user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  existing_interaction TEXT;
BEGIN
  SELECT interaction_type INTO existing_interaction
  FROM public.answer_interactions
  WHERE answer_interactions.answer_id = increment_answer_likes.answer_id
  AND answer_interactions.user_id = increment_answer_likes.user_id;

  IF existing_interaction IS NULL THEN
    INSERT INTO public.answer_interactions (user_id, answer_id, interaction_type)
    VALUES (increment_answer_likes.user_id, increment_answer_likes.answer_id, 'like');
    UPDATE public.answers SET likes = likes + 1 WHERE id = increment_answer_likes.answer_id;
  ELSIF existing_interaction = 'dislike' THEN
    UPDATE public.answer_interactions
    SET interaction_type = 'like', updated_at = now()
    WHERE answer_interactions.answer_id = increment_answer_likes.answer_id
    AND answer_interactions.user_id = increment_answer_likes.user_id;
    UPDATE public.answers SET likes = likes + 1, dislikes = dislikes - 1 WHERE id = increment_answer_likes.answer_id;
  END IF;
END;
$$;

-- 4. Replace increment_answer_dislikes with authorized version
CREATE OR REPLACE FUNCTION public.increment_answer_dislikes(answer_id uuid, user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  existing_interaction TEXT;
BEGIN
  SELECT interaction_type INTO existing_interaction
  FROM public.answer_interactions
  WHERE answer_interactions.answer_id = increment_answer_dislikes.answer_id
  AND answer_interactions.user_id = increment_answer_dislikes.user_id;

  IF existing_interaction IS NULL THEN
    INSERT INTO public.answer_interactions (user_id, answer_id, interaction_type)
    VALUES (increment_answer_dislikes.user_id, increment_answer_dislikes.answer_id, 'dislike');
    UPDATE public.answers SET dislikes = dislikes + 1 WHERE id = increment_answer_dislikes.answer_id;
  ELSIF existing_interaction = 'like' THEN
    UPDATE public.answer_interactions
    SET interaction_type = 'dislike', updated_at = now()
    WHERE answer_interactions.answer_id = increment_answer_dislikes.answer_id
    AND answer_interactions.user_id = increment_answer_dislikes.user_id;
    UPDATE public.answers SET dislikes = dislikes + 1, likes = likes - 1 WHERE id = increment_answer_dislikes.answer_id;
  END IF;
END;
$$;

-- 5. Drop the old single-parameter overloads
DROP FUNCTION IF EXISTS public.increment_answer_likes(uuid);
DROP FUNCTION IF EXISTS public.increment_answer_dislikes(uuid);
