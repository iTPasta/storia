
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
import { findBestMatchingStory } from '@/utils/stringMatching';

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

  const handleStoryClick = (title: string) => {
    setStorySearch(title);
  };

  const handleStoryRequest = async () => {
    setIsLoading(true);
    const searchTerm = storySearch.toLowerCase().trim();

    try {
      if (!searchTerm) {
        await generateAndTellStory('');
        return;
      }

      // Find the best matching story based on Levenshtein distance
      const bestMatch = findBestMatchingStory(searchTerm, stories, language);
      const foundStory = bestMatch ? stories.find(story => 
        (language === 'en' ? story.title : story.title_fr).toLowerCase() === bestMatch.toLowerCase()
      ) : null;

      if (foundStory) {
        try {
          await tellExistingStory(foundStory);
        } catch (error) {
          console.error('Error telling existing story:', error);
          toast({
            title: t('Error with this story', 'Problème avec cette histoire'),
            description: t('Generating a new story instead', 'Génération d\'une nouvelle histoire à la place'),
            variant: 'destructive'
          });
          
          // Fallback to generating a story if the existing one fails
          await generateAndTellStory(storySearch);
        }
      } else {
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

  const tellExistingStory = async (story: Story) => {
    try {
      const completeStory = await fetchStorySegments(story);
      onStorySelect(completeStory);
    } catch (error) {
      console.error('Error fetching story details:', error);
      toast({
        title: t('Error fetching story details', 'Erreur lors de la récupération des détails de l\'histoire'),
        variant: 'destructive'
      });
      throw error; // Rethrow to allow the calling function to handle it
    }
  };

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
      console.error('Error generating story:', error);
      toast({
        title: t('Failed to generate story', 'Échec de la génération de l\'histoire'),
        description: t('Please try again later', 'Veuillez réessayer plus tard'),
        variant: 'destructive'
      });
      throw error;
    }
  };

  const handleSearchResult = (transcript: string) => {
    setStorySearch(transcript);

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
