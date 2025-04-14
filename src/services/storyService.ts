
import { Story, SAMPLE_STORIES, StorySegment } from '@/types/story';
import { supabase } from '@/integrations/supabase/client';
import { Emotion } from '@/components/Robot';
import { useToast } from '@/components/ui/use-toast';

// Helper function to validate emotion string as Emotion type
export const validateEmotion = (emotion: string): Emotion => {
  const validEmotions: Emotion[] = ['happy', 'sad', 'surprised', 'angry', 'neutral'];
  return validEmotions.includes(emotion as Emotion)
    ? (emotion as Emotion)
    : 'neutral';
};

// Fetch available stories
export const fetchStories = async (
  language: 'en' | 'fr',
  onSuccess: (stories: Story[]) => void,
  onError: () => void
) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('id, title, title_fr');

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      onSuccess(data);
      return data;
    } else {
      throw new Error('No stories found');
    }
  } catch (error) {
    console.error('Error fetching stories:', error);
    onError();
    return SAMPLE_STORIES;
  }
};

// Fetch an existing story's segments
export const fetchStorySegments = async (story: Story): Promise<Story> => {
  try {
    // If segments aren't loaded yet, fetch them
    if (!story.segments) {
      const { data: segmentsData, error } = await supabase
        .from('story_segments')
        .select('*')
        .eq('story_id', story.id)
        .order('sequence_order', { ascending: true });

      if (error) throw error;

      if (segmentsData && segmentsData.length > 0) {
        // Convert the segments to the correct type
        const typedSegments: StorySegment[] = segmentsData.map(segment => ({
          ...segment,
          emotion: validateEmotion(segment.emotion)
        }));

        return {
          ...story,
          segments: typedSegments
        };
      }
    } else {
      // If segments are already loaded, use them directly
      return story;
    }

    // If we couldn't get segments from Supabase, try to use local sample
    const fallbackStory = SAMPLE_STORIES.find(s => s.id === story.id);
    if (fallbackStory) {
      return fallbackStory;
    } else {
      throw new Error('Could not load story segments');
    }
  } catch (error) {
    console.error('Error fetching story segments:', error);
    throw error;
  }
};

// Generate a new AI story
export const generateAIStory = async (
  storyName: string, 
  language: 'en' | 'fr'
): Promise<Story> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-story', {
      body: { storyName, language },
    });

    if (error) {
      console.error('Error calling generate-story function:', error);
      throw error;
    }

    if (!data || !data.segments) {
      throw new Error('Invalid story data received');
    }

    // Ensure the emotions are valid
    return {
      ...data,
      segments: data.segments.map(segment => ({
        ...segment,
        emotion: validateEmotion(segment.emotion)
      }))
    };
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
};
