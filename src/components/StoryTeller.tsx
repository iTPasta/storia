
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Robot from './Robot';
import StorySearch from './StorySearch';
import StoryPlayer from './StoryPlayer';
import { Story, SAMPLE_STORIES } from '@/types/story';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitch from './LanguageSwitch';

const StoryTeller: React.FC = () => {
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentEmotion, setCurrentEmotion] = useState<'happy' | 'sad' | 'surprised' | 'angry' | 'neutral'>('neutral');
  const [currentText, setCurrentText] = useState('');
  
  const { toast } = useToast();
  const { language } = useLanguage();
  
  // Speech synthesis setup
  const handleSpeechEnd = () => {
    if (currentStory && currentStory.segments && currentSegmentIndex < currentStory.segments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
    } else {
      stopStory();
    }
  };
  
  const { speak, pause, cancel } = useSpeechSynthesis({
    onEnd: handleSpeechEnd
  });
  
  // Update emotion and text when segment changes
  useEffect(() => {
    if (currentStory && currentStory.segments && currentStory.segments[currentSegmentIndex]) {
      const segment = currentStory.segments[currentSegmentIndex];
      setCurrentEmotion(segment.emotion);
      
      // Use the appropriate language text
      const textContent = language === 'en' ? segment.text : segment.text_fr;
      setCurrentText(textContent);
      
      if (isPlaying) {
        speak(textContent);
      }
    }
  }, [currentStory, currentSegmentIndex, isPlaying, language]);
  
  // Handle story selection
  const handleStorySelect = (story: Story) => {
    setCurrentStory(story);
    setCurrentSegmentIndex(0);
    setIsPlaying(true);
  };
  
  // Playback controls
  const playStory = () => {
    setIsPlaying(true);
  };
  
  const pauseStory = () => {
    setIsPlaying(false);
    pause();
  };
  
  const stopStory = () => {
    setIsPlaying(false);
    setCurrentSegmentIndex(0);
    cancel();
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto p-4">
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-primary">StorIA</h1>
        <LanguageSwitch />
      </div>
      
      <Robot emotion={currentEmotion} isPlaying={isPlaying} />
      
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
  );
};

export default StoryTeller;
