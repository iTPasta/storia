
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, StopCircle } from 'lucide-react';
import { Story } from '@/types/story';

interface StoryPlayerProps {
  currentText: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({ 
  currentText, 
  isPlaying, 
  onPlay, 
  onPause, 
  onStop 
}) => {
  return (
    <>
      <div className="story-text mt-6">
        {currentText}
      </div>
      
      <div className="control-buttons">
        {isPlaying ? (
          <Button 
            className="control-button bg-robot-accent hover:bg-robot-accent/80"
            onClick={onPause}
          >
            <Pause className="mr-2 h-6 w-6" /> Pause
          </Button>
        ) : (
          <Button 
            className="control-button bg-robot-primary hover:bg-robot-primary/80"
            onClick={onPlay}
          >
            <Play className="mr-2 h-6 w-6" /> Play
          </Button>
        )}
        
        <Button 
          className="control-button bg-destructive hover:bg-destructive/80"
          onClick={onStop}
        >
          <StopCircle className="mr-2 h-6 w-6" /> Stop
        </Button>
      </div>
    </>
  );
};

export default StoryPlayer;
