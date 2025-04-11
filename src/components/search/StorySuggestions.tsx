
import React from 'react';
import { Story } from '@/types/story';
import { formatStoryTitleList } from '@/utils/storyFormatters';
import { useLanguage } from '@/contexts/LanguageContext';

interface StorySuggestionsProps {
  stories: Story[];
  onTitleClick: (title: string) => void;
}

const StorySuggestions: React.FC<StorySuggestionsProps> = ({ 
  stories,
  onTitleClick
}) => {
  const { language } = useLanguage();

  return (
    <p className="text-sm mb-6 text-muted-foreground text-center">
      {language === 'en'
        ? <>Try asking for {formatStoryTitleList(stories, language, onTitleClick)} for example, or leave empty for a random story</>
        : <>Essayez de demander {formatStoryTitleList(stories, language, onTitleClick)} par exemple, ou laissez vide pour une histoire aléatoire</>}
    </p>
  );
};

export default StorySuggestions;
