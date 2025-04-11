
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Story, StorySegment, SAMPLE_STORIES } from '@/types/story';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Emotion } from '@/components/Robot';

interface StorySearchProps {
  onStorySelect: (story: Story) => void;
  availableStories: Story[];
}

const StorySearch: React.FC<StorySearchProps> = ({ onStorySelect, availableStories }) => {
  const [storySearch, setStorySearch] = useState('');
  const [stories, setStories] = useState<Story[]>(availableStories);
  const [isLoading, setIsLoading] = useState(false);
  const { language, t } = useLanguage();
  const { toast } = useToast();

  // Helper function to convert emotion string to Emotion type
  const validateEmotion = (emotion: string): Emotion => {
    const validEmotions: Emotion[] = ['happy', 'sad', 'surprised', 'angry', 'neutral'];
    return validEmotions.includes(emotion as Emotion)
      ? (emotion as Emotion)
      : 'neutral';
  };

  // Fetch stories from Supabase
  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('id, title, title_fr');

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setStories(data);
          toast({
            title: t('Stories loaded successfully', 'Histoires chargées avec succès'),
            description: t(`${data.length} stories available`, `${data.length} histoires disponibles`),
          });
        } else {
          throw new Error('No stories found');
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
        toast({
          title: t('Error fetching stories', 'Erreur lors de la récupération des histoires'),
          description: t('Using fallback sample stories', 'Utilisation des histoires d\'exemple'),
          variant: 'destructive'
        });

        // Use sample stories as fallback
        setStories(SAMPLE_STORIES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [t, toast]);

  // Function to handle clicking on a suggested story title
  const handleStoryClick = (title: string) => {
    setStorySearch(title);
  };

  // Helper function to format story titles with proper separators
  const formatStoryList = (storyArray: Story[]): JSX.Element => {
    if (storyArray.length === 0) return <></>;

    const titles = storyArray.map(story => {
      const title = language === 'en' ? story.title : story.title_fr;
      return (
        <span
          key={story.id}
          className="text-sky-500 cursor-pointer"
          onClick={() => handleStoryClick(title)}
        >
          "{title}"
        </span>
      );
    });

    if (titles.length === 1) {
      return titles[0];
    } else if (titles.length === 2) {
      return (
        <>
          {titles[0]} {language === 'en' ? ' or ' : ' ou '} {titles[1]}
        </>
      );
    } else {
      const lastTitle = titles.pop();
      return (
        <>
          {titles.reduce((prev, curr, i) => (
            <>
              {prev}{i > 0 ? ', ' : ''}{curr}
            </>
          ))}
          {language === 'en' ? ', or ' : ', ou '}{lastTitle}
        </>
      );
    }
  };

  const handleStoryRequest = async () => {
    setIsLoading(true);
    const searchTerm = storySearch.toLowerCase().trim();

    try {
      // Case 1: Empty search term - generate a random story
      if (!searchTerm) {
        await generateAndTellStory('');
        return;
      }

      // Case 2: Search for existing story
      const foundStory = stories.find(story =>
        (language === 'en' ? story.title : story.title_fr).toLowerCase().includes(searchTerm)
      );

      if (foundStory) {
        await tellExistingStory(foundStory);
      } else {
        // Case 3: Generate a story with the provided name
        await generateAndTellStory(storySearch);
      }
    } catch (error) {
      console.error('Error handling story request:', error);
      toast({
        title: t('Error', 'Erreur'),
        description: t('Something went wrong', 'Quelque chose s\'est mal passé'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to tell an existing story
  const tellExistingStory = async (story: Story) => {
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

          const completeStory: Story = {
            ...story,
            segments: typedSegments
          };

          onStorySelect(completeStory);
          return;
        }
      } else {
        // If segments are already loaded, use them directly
        onStorySelect(story);
        return;
      }

      // If we couldn't get segments from Supabase, try to use local sample
      const fallbackStory = SAMPLE_STORIES.find(s => s.id === story.id);
      if (fallbackStory) {
        onStorySelect(fallbackStory);
      } else {
        throw new Error('Could not load story segments');
      }
    } catch (error) {
      console.error('Error fetching story segments:', error);
      toast({
        title: t('Error fetching story details', 'Erreur lors de la récupération des détails de l\'histoire'),
        variant: 'destructive'
      });
    }
  };

  // Function to generate and tell a story using the edge function
  const generateAndTellStory = async (storyName: string) => {
    try {
      toast({
        title: storyName
          ? t(`Generating story about "${storyName}"`, `Génération d'une histoire sur "${storyName}"`)
          : t('Generating a random story', 'Génération d\'une histoire aléatoire'),
        description: t('This might take a moment...', 'Cela peut prendre un moment...'),
      });

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
      const storyWithValidEmotions: Story = {
        ...data,
        segments: data.segments.map(segment => ({
          ...segment,
          emotion: validateEmotion(segment.emotion)
        }))
      };

      onStorySelect(storyWithValidEmotions);
    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: t('Failed to generate story', 'Échec de la génération de l\'histoire'),
        description: t('Please try again later', 'Veuillez réessayer plus tard'),
        variant: 'destructive'
      });
    }
  };

  const handleSearchResult = (transcript: string) => {
    setStorySearch(transcript);

    // Auto-search after voice input with a short delay
    setTimeout(() => {
      setStorySearch(transcript);
      handleStoryRequest();
    }, 1000);
  };

  const { isListening, startListening } = useSpeechRecognition({
    onResult: handleSearchResult,
    lang: language === 'en' ? 'en-US' : 'fr-FR'
  });

  return (
    <div className="flex flex-col items-center mt-8 w-full">
      <p className="text-2xl mb-4 text-center">
        {t('What story would you like to hear?', 'Quelle histoire aimeriez-vous entendre?')}
      </p>
      <p className="text-sm mb-6 text-muted-foreground text-center">
        {language === 'en'
          ? <>Try asking for {formatStoryList(stories)} for example, or leave empty for a random story</>
          : <>Essayez de demander {formatStoryList(stories)} par exemple, ou laissez vide pour une histoire aléatoire</>}
      </p>

      <div className="story-input flex items-center gap-2">
        <Input
          placeholder={t('Type a story name or leave empty...', 'Tapez un nom d\'histoire ou laissez vide...')}
          value={storySearch}
          onChange={(e) => setStorySearch(e.target.value)}
          className="rounded-full text-lg py-6"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleStoryRequest();
            }
          }}
        />

        <Button
          onClick={startListening}
          className={cn(
            "rounded-full p-3",
            isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-robot-primary hover:bg-robot-primary/80"
          )}
          disabled={isListening}
        >
          <Mic size={24} />
        </Button>
      </div>

      <Button
        onClick={handleStoryRequest}
        className="mt-4 bg-robot-primary hover:bg-robot-primary/80 text-lg py-6 px-8 rounded-full"
        disabled={isLoading}
      >
        {isLoading
          ? t('Generating...', 'Génération en cours...')
          : t(!storySearch.trim()
            ? 'Tell me a random story!'
            : 'Tell me this story!',
            !storySearch.trim()
              ? 'Raconte-moi une histoire aléatoire !'
              : 'Raconte-moi cette histoire!')}
      </Button>
    </div>
  );
};

export default StorySearch;
