
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Story, SAMPLE_STORIES } from '@/types/story';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import StorySuggestions from './search/StorySuggestions';
import { fetchStories, fetchStorySegments, generateAIStory } from '@/services/storyService';

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

  // Fetch stories from Supabase
  useEffect(() => {
    const loadStories = async () => {
      setIsLoading(true);
      
      const stories = await fetchStories(
        language,
        (data) => {
          toast({
            title: t('Stories loaded successfully', 'Histoires chargées avec succès'),
            description: t(`${data.length} stories available`, `${data.length} histoires disponibles`),
          });
        },
        () => {
          toast({
            title: t('Error fetching stories', 'Erreur lors de la récupération des histoires'),
            description: t('Using fallback sample stories', 'Utilisation des histoires d\'exemple'),
            variant: 'destructive'
          });
        }
      );
      
      setStories(stories);
      setIsLoading(false);
    };

    loadStories();
  }, [t, toast, language]);

  // Function to handle clicking on a suggested story title
  const handleStoryClick = (title: string) => {
    setStorySearch(title);
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
      const completeStory = await fetchStorySegments(story);
      onStorySelect(completeStory);
    } catch (error) {
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

      const generatedStory = await generateAIStory(storyName, language);
      onStorySelect(generatedStory);
    } catch (error) {
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
      
      <StorySuggestions 
        stories={stories} 
        onTitleClick={handleStoryClick} 
      />

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
