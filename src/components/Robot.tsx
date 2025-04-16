
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils'; // Ensure this utility function is correctly implemented or replace it with a classNames library.

// Emotion types
export type Emotion = 'excited' | 'happy' | 'sad' | 'afraid' | 'disgusted' | 'confused' | 'angry' | 'neutral';

interface RobotProps {
  emotion: Emotion;
  isPlaying: boolean;
  className?: string;
}

// Define emotion images
const emotionImages: Record<Emotion, string> = {
  excited: '/emotions/qt_happy_blinking_framed.gif',
  happy: '/emotions/qt_happy_framed.gif',
  sad: '/emotions/qt_cry_framed.gif',
  afraid: '/emotions/qt_afraid_framed.gif',
  disgusted: '/emotions/qt_disgusted_framed.gif',
  confused: '/emotions/qt_confused_framed.gif',
  angry: '/emotions/qt_angry_framed.gif',
  neutral: '/emotions/qt_neutral_state_blinking_framed.gif',
};

const Robot: React.FC<RobotProps> = ({
  emotion = 'neutral',
  isPlaying = false,
  className
}) => {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(emotion);

  // Update emotion when the prop changes
  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  console.log(emotion, isPlaying);

  return (
    <div className={cn("robot-container relative", className)}>
      <div className="robot-face">
        {/* Make sure the image is displayed with proper dimensions */}
        <img
          src={isPlaying ? emotionImages[currentEmotion] : emotionImages['neutral']}
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
