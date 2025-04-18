
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useLanguage } from '@/contexts/LanguageContext';

interface StoryInputProps {
  storySearch: string;
  onSearchChange: (value: string) => void;
  onSubmit: () => void;
}

const StoryInput: React.FC<StoryInputProps> = ({
  storySearch,
  onSearchChange,
  onSubmit
}) => {
  const { t, language } = useLanguage();

  const handleSearchResult = (transcript: string) => {
    onSearchChange(transcript);
  };

  const { isListening, startListening } = useSpeechRecognition({
    onResult: handleSearchResult,
    lang: language === 'en' ? 'en-US' : 'fr-FR'
  });

  return (
    <div className="story-input flex items-center gap-2">
      <Input
        placeholder={t('Type a story name or leave empty...', 'Tape un nom d\'histoire ou laisse vide...')}
        value={storySearch}
        onChange={(e) => onSearchChange(e.target.value)}
        className="rounded-full text-lg py-6"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSubmit();
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
  );
};

export default StoryInput;
