
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface SearchButtonProps {
  isLoading: boolean;
  loadingAction: 'fetching' | 'searching' | 'generating';
  storySearch: string;
  onClick: () => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({
  isLoading,
  loadingAction,
  storySearch,
  onClick
}) => {
  const { t } = useLanguage();

  const getButtonText = () => {
    if (!isLoading) {
      return t(!storySearch.trim()
        ? 'Tell me a random story!'
        : 'Tell me this story!',
        !storySearch.trim()
          ? 'Raconte-moi une histoire aléatoire !'
          : 'Raconte-moi cette histoire!');
    }

    switch (loadingAction) {
      case 'fetching':
        return t('Loading stories...', 'Chargement des histoires...');
      case 'searching': 
        return t('Finding story...', 'Recherche de l\'histoire...');
      case 'generating':
        return t('Generating...', 'Génération en cours...');
      default:
        return t('Loading...', 'Chargement...');
    }
  };

  return (
    <Button
      onClick={onClick}
      className="mt-4 bg-robot-primary hover:bg-robot-primary/80 text-lg py-6 px-8 rounded-full"
      disabled={isLoading}
    >
      {getButtonText()}
    </Button>
  );
};

export default SearchButton;
