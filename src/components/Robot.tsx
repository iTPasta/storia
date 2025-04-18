
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Emotion types
export type Emotion = 'excited' | 'happy' | 'sad' | 'afraid' | 'disgusted' | 'confused' | 'angry' | 'neutral';

interface RobotProps {
  emotion: Emotion;
  isPlaying: boolean;
  className?: string;
}

// Define emotion images paths
const getEmotionImagePath = (emotion: Emotion, useHeadOnly: boolean): string => {
  const emotionFileNamesMap: Record<Emotion, string> = {
    excited: 'qt_happy_blinking_framed',
    happy: 'qt_happy_framed',
    sad: 'qt_cry_framed',
    afraid: 'qt_afraid_framed',
    disgusted: 'qt_disgusted_framed',
    confused: 'qt_confused_framed',
    angry: 'qt_angry_framed',
    neutral: 'qt_neutral_state_blinking_framed'
  };
  const emotionFileName = emotionFileNamesMap[emotion];
  const directory = useHeadOnly ? '/emotions_head/' : '/emotions_body/';
  const suffix = useHeadOnly ? '_head' : '';

  return `${directory}${emotionFileName}${suffix}.gif`;
};

const Robot: React.FC<RobotProps> = ({
  emotion = 'neutral',
  isPlaying = false,
  className
}) => {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(emotion);
  const isMobile = useIsMobile();

  // Update emotion when the prop changes
  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  return (
    <div
      className={cn(
        "robot-container relative",
        isMobile && "mb-0 h-auto", // Remove bottom margin in mobile view
        className
      )}
    >
      <div className="robot-face">
        <img
          src={isPlaying
            ? getEmotionImagePath(currentEmotion, isMobile)
            : getEmotionImagePath('neutral', isMobile)}
          alt={`Robot feeling ${currentEmotion}`}
          className={cn(
            "w-full h-full object-contain",
            isPlaying && currentEmotion === 'excited' && "animate-bounce",
          )}
        />
      </div>
    </div>
  );
};

export default Robot;
