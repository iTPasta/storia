
import { useEffect, useRef, useCallback } from 'react';
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
  
  // Set up the utterance with the correct language
  const setupUtterance = useCallback(() => {
    speakRef.current = new SpeechSynthesisUtterance();
    speakRef.current.rate = rate;
    speakRef.current.pitch = pitch;
    speakRef.current.lang = language === 'en' ? 'en-US' : 'fr-FR';
    
    if (onEnd) {
      speakRef.current.onend = onEnd;
    }
  }, [language, onEnd, rate, pitch]);
  
  useEffect(() => {
    setupUtterance();
    
    return () => {
      if (speakRef.current) {
        speakRef.current.onend = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [setupUtterance]);

  // Recreate the utterance when language changes
  useEffect(() => {
    if (speakRef.current) {
      speakRef.current.lang = language === 'en' ? 'en-US' : 'fr-FR';
    }
  }, [language]);

  const speak = useCallback((text: string) => {
    // Ensure we cancel any ongoing speech first
    window.speechSynthesis.cancel();
    
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
  }, [language]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return {
    speak,
    pause,
    resume,
    cancel
  };
};
