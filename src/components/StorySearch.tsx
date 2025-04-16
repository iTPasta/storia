
import React, { useState, useEffect } from 'react';
import { Story } from '@/types/story';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { fetchStories, fetchStorySegments, generateAIStory } from '@/services/storyService';
import { findBestMatchingStory } from '@/utils/stringMatching';
import StorySuggestions from './search/StorySuggestions';
import StoryInput from './search/StoryInput';
import SearchButton from './search/SearchButton';

interface StorySearchProps {
  onStorySelect: (story: Story) => void;
  availableStories: Story[];
}

const StorySearch: React.FC<StorySearchProps> = ({ onStorySelect, availableStories }) => {
  const [storySearch, setStorySearch] = useState('');
  const [stories, setStories] = useState<Story[]>(availableStories);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'fetching' | 'searching' | 'generating'>('fetching');
  const { language, t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    const loadStories = async () => {
      setIsLoading(true);
      setLoadingAction('fetching');

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

  const handleStoryRequest = async () => {
    setIsLoading(true);
    const searchTerm = storySearch.toLowerCase().trim();

    try {
      if (!searchTerm) {
        setLoadingAction('generating');
        await generateAndTellStory('');
        return;
      }

      const bestMatch = findBestMatchingStory(searchTerm, stories, language);
      const foundStory = bestMatch ? stories.find(story =>
        (language === 'en' ? story.title : story.title_fr).toLowerCase() === bestMatch.toLowerCase()
      ) : null;

      if (foundStory) {
        setLoadingAction('searching');
        await tellExistingStory(foundStory);
      } else {
        setLoadingAction('generating');
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
      toast({
        title: t('Error fetching story details', 'Erreur lors de la récupération des détails de l\'histoire'),
        variant: 'destructive'
      });
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
      toast({
        title: t('Failed to generate story', 'Échec de la génération de l\'histoire'),
        description: t('Please try again later', 'Veuillez réessayer plus tard'),
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-col items-center mt-8 w-full">
      <p className="text-2xl mb-4 text-center">
        {t('What story would you like to hear?', 'Quelle histoire aimerais-tu entendre?')}
      </p>

      <StorySuggestions
        stories={stories}
        onTitleClick={setStorySearch}
      />

      <StoryInput
        storySearch={storySearch}
        onSearchChange={setStorySearch}
        onSubmit={handleStoryRequest}
      />

      <SearchButton
        isLoading={isLoading}
        loadingAction={loadingAction}
        storySearch={storySearch}
        onClick={handleStoryRequest}
      />
    </div>
  );
};

export default StorySearch;
