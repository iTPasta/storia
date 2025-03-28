
import { useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { language } = useLanguage();
  
  useEffect(() => {
    speakRef.current = new SpeechSynthesisUtterance();
    speakRef.current.rate = rate;
    speakRef.current.pitch = pitch;
    speakRef.current.lang = language === 'en' ? 'en-US' : 'fr-FR';
    
    if (onEnd) {
      speakRef.current.onend = onEnd;
    }
    
    return () => {
      if (speakRef.current) {
        speakRef.current.onend = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [onEnd, rate, pitch, language]);

  const speak = (text: string) => {
    if (speakRef.current) {
      speakRef.current.text = text;
      // Try to find a voice that matches the current language
      const voices = window.speechSynthesis.getVoices();
      const languageCode = language === 'en' ? 'en' : 'fr';
      
      const matchingVoice = voices.find(voice => 
        voice.lang.startsWith(languageCode) && !voice.localService
      );
      
      if (matchingVoice) {
        speakRef.current.voice = matchingVoice;
      }
      
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
