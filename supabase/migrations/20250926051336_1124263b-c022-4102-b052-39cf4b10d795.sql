-- Create function to increment post likes
CREATE OR REPLACE FUNCTION public.increment_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts 
  SET likes = likes + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment post dislikes
CREATE OR REPLACE FUNCTION public.increment_post_dislikes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts 
  SET dislikes = dislikes + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment answer likes
CREATE OR REPLACE FUNCTION public.increment_answer_likes(answer_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.answers 
  SET likes = likes + 1 
  WHERE id = answer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment answer dislikes
CREATE OR REPLACE FUNCTION public.increment_answer_dislikes(answer_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.answers 
  SET dislikes = dislikes + 1 
  WHERE id = answer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;