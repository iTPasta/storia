
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils'; // Ensure this utility function is correctly implemented or replace it with a classNames library.

// Emotion types
export type Emotion = 'happy' | 'sad' | 'surprised' | 'angry' | 'neutral';

interface RobotProps {
  emotion: Emotion;
  isPlaying: boolean;
  className?: string;
}

// Define emotion images
const emotionImages: Record<Emotion, string> = {
  happy: '/emotions/qt_happy_framed.gif', // Ensure the paths are correct relative to the folder
  sad: '/emotions/qt_cry_framed.gif',
  surprised: '/emotions/qt_confused_framed.gif',
  angry: '/emotions/qt_angry_framed.gif',
  neutral: '/emotions/qt_neutral_framed.gif',
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
          src={emotionImages[currentEmotion]}
          alt={`Robot feeling ${currentEmotion}`}
          className={cn(
            "w-full h-full object-contain",
            isPlaying && currentEmotion === 'happy' && "animate-bounce",
          )}
        />
      </div>
    </div>
  );
};

export default Robot;
