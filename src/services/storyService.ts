
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

    console.log(`No segments found for story "${story.title}" - trying to generate fallback`);
    
    // If we get here, no segments were found in the database
    // Try to find a matching sample story to use as fallback
    const fallbackStory = SAMPLE_STORIES.find(s => s.id === story.id || 
                                                   s.title === story.title || 
                                                   s.title_fr === story.title_fr);
    
    // If a matching sample story was found, use that
    if (fallbackStory) {
      console.log(`Using sample story as fallback for "${story.title}"`);
      return {
        ...story,
        segments: fallbackStory.segments
      };
    }
    
    // If no matching sample story, try to generate one with basic content
    console.log(`Creating default segments for story "${story.title}" as last resort`);
    const defaultSegments: StorySegment[] = [
      {
        id: `generated-${story.id}-1`,
        text: `Once upon a time, there was a story called "${story.title}".`,
        text_fr: `Il était une fois, une histoire appelée "${story.title_fr}".`,
        emotion: 'neutral',
        sequence_order: 1
      },
      {
        id: `generated-${story.id}-2`,
        text: "We don't have the full details of this story yet.",
        text_fr: "Nous n'avons pas encore tous les détails de cette histoire.",
        emotion: 'sad',
        sequence_order: 2
      },
      {
        id: `generated-${story.id}-3`,
        text: "But we hope to add it soon!",
        text_fr: "Mais nous espérons l'ajouter bientôt !",
        emotion: 'happy',
        sequence_order: 3
      }
    ];
    
    return {
      ...story,
      segments: defaultSegments
    };
  } catch (error) {
    console.error('Error fetching story segments:', error);
    
    // Last resort fallback - create a basic story with error info
    const errorSegments: StorySegment[] = [
      {
        id: `error-${story.id}-1`,
        text: `We couldn't load the story "${story.title}" right now.`,
        text_fr: `Nous n'avons pas pu charger l'histoire "${story.title_fr}" pour le moment.`,
        emotion: 'sad',
        sequence_order: 1
      },
      {
        id: `error-${story.id}-2`,
        text: "Please try another story or try again later.",
        text_fr: "Veuillez essayer une autre histoire ou réessayer plus tard.",
        emotion: 'neutral',
        sequence_order: 2
      }
    ];
    
    return {
      ...story,
      segments: errorSegments
    };
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
