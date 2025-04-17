
import React, { useEffect, useState, useRef } from 'react';
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
  const directory = useHeadOnly ? '/emotions_head/' : '/emotions_body/';
  const suffix = useHeadOnly ? '_head' : '';
  
  return `${directory}qt_${emotion}_framed${suffix}.gif`;
};

const Robot: React.FC<RobotProps> = ({
  emotion = 'neutral',
  isPlaying = false,
  className
}) => {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(emotion);
  const containerRef = useRef<HTMLDivElement>(null);
  const [useHeadOnly, setUseHeadOnly] = useState(false);
  const isMobile = useIsMobile();

  // Update emotion when the prop changes
  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  // Check container width to determine which image type to use
  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setUseHeadOnly(containerWidth < 280);
      }
    };

    // Initial check
    checkWidth();
    
    // Add resize listener
    window.addEventListener('resize', checkWidth);
    
    return () => {
      window.removeEventListener('resize', checkWidth);
    };
  }, []);

  console.log(emotion, isPlaying, useHeadOnly ? 'head' : 'body');

  return (
    <div 
      ref={containerRef} 
      className={cn("robot-container relative", className)}
    >
      <div className="robot-face">
        <img
          src={isPlaying 
            ? getEmotionImagePath(currentEmotion, useHeadOnly) 
            : getEmotionImagePath('neutral', useHeadOnly)}
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
