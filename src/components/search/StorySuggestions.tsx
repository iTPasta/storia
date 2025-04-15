
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
        ? <>Try asking for {formatStoryTitleList(stories, language, onTitleClick)} for example, or type your own story name, if you have no story idea you can also leave the field empty</>
        : <>Essaye de demander {formatStoryTitleList(stories, language, onTitleClick)} par exemple, ou bien entre le nom de ta propre histoire, sinon si tu n'as pas d'idée tu peux aussi laisser le champ libre</>}
    </p>
  );
};

export default StorySuggestions;
