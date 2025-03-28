
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Emotion types
export type Emotion = 'happy' | 'sad' | 'surprised' | 'angry' | 'neutral';

interface RobotProps {
  emotion: Emotion;
  isPlaying: boolean;
  className?: string;
}

// Define emotion images
const emotionImages: Record<Emotion, string> = {
  happy: '/emotions/qt_happy.gif',
  sad: '/emotions/qt_cry.gif',
  surprised: '/emotions/qt_confused.gif',
  angry: '/emotions/qt_angry.gif',
  neutral: '/emotions/qt_neutral.gif',
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
    <div className={cn("robot-container relative", className)}>
      <div className="robot-face">
        {/* Make sure the image is displayed with proper dimensions */}
        <img
          src={emotionImages[currentEmotion]}
          alt={`Robot feeling ${currentEmotion}`}
          className={cn(
            "w-full h-full object-contain",
            isPlaying && currentEmotion === 'happy' && "animate-bounce",
            isPlaying && "animate-pulse"
          )}
        />
      </div>
      
      {/* The frame image goes after the face to overlay properly */}
      <img
        src="/qt_frame.png"
        alt="Robot frame"
        className="robot-frame absolute top-0 left-0 w-full h-full object-contain z-10"
      />
      
      {isPlaying && (
        <div className="speaking-indicator absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: "300ms" }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: "600ms" }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Robot;
