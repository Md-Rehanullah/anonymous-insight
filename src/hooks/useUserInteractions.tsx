import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserInteraction {
  postId: string;
  interactionType: 'like' | 'dislike' | null;
}

export const useUserInteractions = (postIds: string[]) => {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || postIds.length === 0) {
      setInteractions({});
      return;
    }

    const fetchInteractions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_interactions')
          .select('post_id, interaction_type')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        if (error) throw error;

        const interactionMap: Record<string, 'like' | 'dislike' | null> = {};
        postIds.forEach(postId => {
          interactionMap[postId] = null;
        });

        data?.forEach(interaction => {
          interactionMap[interaction.post_id] = interaction.interaction_type as 'like' | 'dislike';
        });

        setInteractions(interactionMap);
      } catch (error) {
        console.error('Error fetching user interactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, [user, postIds]);

  return { interactions, loading };
};