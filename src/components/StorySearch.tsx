
import React, { useState, useEffect } from 'react';
import { Story } from '@/types/story';
import { useLanguage } from '@/contexts/LanguageContext';
import StorySuggestions from './search/StorySuggestions';
import StoryInput from './search/StoryInput';
import SearchButton from './search/SearchButton';
import { useStoryOperations } from '@/hooks/useStoryOperations';

interface StorySearchProps {
  onStorySelect: (story: Story) => void;
  availableStories: Story[];
}

const StorySearch: React.FC<StorySearchProps> = ({ onStorySelect, availableStories }) => {
  const [storySearch, setStorySearch] = useState('');
  const { t } = useLanguage();
  
  const {
    stories,
    isLoading,
    loadingAction,
    loadStories,
    handleStoryRequest
  } = useStoryOperations({ availableStories, onStorySelect });

  useEffect(() => {
    loadStories();
  }, []);

  const onSubmit = () => {
    handleStoryRequest(storySearch);
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
        onSubmit={onSubmit}
      />

      <SearchButton
        isLoading={isLoading}
        loadingAction={loadingAction}
        storySearch={storySearch}
        onClick={onSubmit}
      />
    </div>
  );
};

export default StorySearch;
