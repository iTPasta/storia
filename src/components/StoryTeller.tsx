
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Robot from './Robot';
import StorySearch from './StorySearch';
import StoryPlayer from './StoryPlayer';
import SettingsDialog from './SettingsDialog';
import { Story, SAMPLE_STORIES } from '@/types/story';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const StoryTeller: React.FC = () => {
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentEmotion, setCurrentEmotion] = useState<'excited' | 'happy' | 'sad' | 'afraid' | 'disgusted' | 'confused' | 'angry' | 'neutral'>('neutral');
  const [currentText, setCurrentText] = useState('');

  const { toast } = useToast();
  const { language } = useLanguage();
  const isMobile = useIsMobile();

  const handleSpeechEnd = () => {
    console.log('Speech ended, moving to next segment');
    if (currentStory && currentStory.segments && currentSegmentIndex < currentStory.segments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
    } else {
      stopStory();
    }
  };

  const { speak, pause, cancel } = useSpeechSynthesis({
    onEnd: handleSpeechEnd
  });

  useEffect(() => {
    if (currentStory && currentStory.segments && currentStory.segments[currentSegmentIndex]) {
      const segment = currentStory.segments[currentSegmentIndex];
      setCurrentEmotion(segment.emotion as 'excited' | 'happy' | 'sad' | 'afraid' | 'disgusted' | 'confused' | 'angry' | 'neutral');

      const textContent = language === 'en' ? segment.text : segment.text_fr;
      setCurrentText(textContent);

      if (isPlaying) {
        console.log('Speaking text:', textContent);
        setTimeout(() => {
          speak(textContent);
        }, 100);
      } else {
        cancel();
      }
    }
  }, [currentStory, currentSegmentIndex, isPlaying, language, speak, cancel]);

  const handleStorySelect = (story: Story) => {
    setCurrentStory(story);
    setCurrentSegmentIndex(0);
    setIsPlaying(true);
  };

  const playStory = () => {
    setIsPlaying(true);
  };

  const pauseStory = () => {
    setIsPlaying(false);
    cancel();
  };

  const stopStory = () => {
    setIsPlaying(false);
    setCurrentSegmentIndex(0);
    setCurrentStory(null);
    cancel();
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4">
        <div className="w-full flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-primary">StorIA</h1>
          <SettingsDialog disabled={isPlaying} />
        </div>
      </div>

      <div className={`w-full flex ${isMobile ? 'flex-col items-center' : 'flex-row gap-8'}`}>
        {isMobile && (
          <div className="mb-8 w-full max-w-[500px]">
            <Robot emotion={currentEmotion} isPlaying={isPlaying} />
          </div>
        )}
        
        <div className="flex-1 flex items-center justify-center min-w-[280px]">
          {currentStory ? (
            <StoryPlayer
              currentText={currentText}
              isPlaying={isPlaying}
              onPlay={playStory}
              onPause={pauseStory}
              onStop={stopStory}
            />
          ) : (
            <StorySearch
              onStorySelect={handleStorySelect}
              availableStories={SAMPLE_STORIES}
            />
          )}
        </div>
        
        {!isMobile && (
          <div className="w-2/5 min-w-[280px]">
            <Robot emotion={currentEmotion} isPlaying={isPlaying} />
          </div>
        )}
      </div>
    </>
  );
};

export default StoryTeller;
