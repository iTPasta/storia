
import { useState } from 'react';
import { Story } from '@/types/story';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { fetchStories, fetchStorySegments, generateAIStory } from '@/services/storyService';
import { findBestMatchingStory } from '@/utils/stringMatching';

export type LoadingAction = 'fetching' | 'searching' | 'generating';

interface UseStoryOperationsProps {
  availableStories: Story[];
  onStorySelect: (story: Story) => void;
}

export const useStoryOperations = ({ availableStories, onStorySelect }: UseStoryOperationsProps) => {
  const [stories, setStories] = useState<Story[]>(availableStories);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>('fetching');
  const { language, t } = useLanguage();
  const { toast } = useToast();

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

  const handleStoryRequest = async (searchTerm: string) => {
    setIsLoading(true);
    const trimmedSearch = searchTerm.toLowerCase().trim();

    try {
      if (!trimmedSearch) {
        setLoadingAction('generating');
        await generateAndTellStory('');
        return;
      }

      const bestMatch = findBestMatchingStory(trimmedSearch, stories, language);
      const foundStory = bestMatch ? stories.find(story =>
        (language === 'en' ? story.title : story.title_fr).toLowerCase() === bestMatch.toLowerCase()
      ) : null;

      if (foundStory) {
        setLoadingAction('searching');
        await tellExistingStory(foundStory);
      } else {
        setLoadingAction('generating');
        await generateAndTellStory(searchTerm);
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

  return {
    stories,
    isLoading,
    loadingAction,
    loadStories,
    handleStoryRequest
  };
};
