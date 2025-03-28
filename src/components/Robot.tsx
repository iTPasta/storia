
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Emotion types
export type Emotion = 'happy' | 'sad' | 'surprised' | 'angry' | 'neutral';

interface RobotProps {
  emotion: Emotion;
  isPlaying: boolean;
  className?: string;
}

// Placeholder for robot frame and emotion images
// In a real application, you would replace these with actual URLs to your images
const emotionImages: Record<Emotion, string> = {
  happy: '/emotions/happy.gif',
  sad: '/emotions/sad.gif',
  surprised: '/emotions/surprised.gif',
  angry: '/emotions/angry.gif',
  neutral: '/emotions/neutral.gif',
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

  return (
    <div className={cn("robot-container", className)}>
      <div className="robot-face">
        <img 
          src={emotionImages[currentEmotion]} 
          alt={`Robot feeling ${currentEmotion}`} 
          className={cn(
            isPlaying && currentEmotion === 'happy' && "animate-bounce", 
            isPlaying && "animate-blink"
          )} 
        />
      </div>
      <img 
        src="/robot_frame.png" 
        alt="Robot frame" 
        className="robot-frame" 
      />
    </div>
  );
};

export default Robot;
