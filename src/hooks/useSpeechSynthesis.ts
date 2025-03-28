
import { useEffect, useRef } from 'react';

interface UseSpeechSynthesisProps {
  onEnd?: () => void;
  rate?: number;
  pitch?: number;
}

export const useSpeechSynthesis = ({ 
  onEnd, 
  rate = 0.9, 
  pitch = 1.2 
}: UseSpeechSynthesisProps = {}) => {
  const speakRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  useEffect(() => {
    speakRef.current = new SpeechSynthesisUtterance();
    speakRef.current.rate = rate; // Slightly slower for kids
    speakRef.current.pitch = pitch; // Slightly higher pitch for a "cuter" voice
    
    if (onEnd) {
      speakRef.current.onend = onEnd;
    }
    
    return () => {
      if (speakRef.current) {
        speakRef.current.onend = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [onEnd, rate, pitch]);

  const speak = (text: string) => {
    if (speakRef.current) {
      speakRef.current.text = text;
      window.speechSynthesis.speak(speakRef.current);
    }
  };

  const pause = () => {
    window.speechSynthesis.pause();
  };

  const resume = () => {
    window.speechSynthesis.resume();
  };

  const cancel = () => {
    window.speechSynthesis.cancel();
  };

  return {
    speak,
    pause,
    resume,
    cancel
  };
};
