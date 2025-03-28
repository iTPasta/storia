
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
    // Initialize speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setupUtterance();
      
      // Make sure we clean up to prevent memory leaks
      return () => {
        if (speakRef.current) {
          speakRef.current.onend = null;
          window.speechSynthesis.cancel();
        }
      };
    }
  }, [setupUtterance]);

  // Recreate the utterance when language changes
  useEffect(() => {
    if (speakRef.current) {
      speakRef.current.lang = language === 'en' ? 'en-US' : 'fr-FR';
    }
  }, [language]);

  const speak = useCallback((text: string) => {
    // Make sure speechSynthesis is available
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.error('Speech synthesis not available');
      return;
    }
    
    // Ensure we cancel any ongoing speech first
    window.speechSynthesis.cancel();
    
    if (speakRef.current) {
      speakRef.current.text = text;
      
      // Try to find a voice that matches the current language
      const voices = window.speechSynthesis.getVoices();
      const languageCode = language === 'en' ? 'en' : 'fr';
      
      // First try to find a non-local service voice with exact language match
      let matchingVoice = voices.find(voice => 
        voice.lang.startsWith(languageCode) && !voice.localService
      );
      
      // If no matching non-local voice, try any voice with the language
      if (!matchingVoice) {
        matchingVoice = voices.find(voice => 
          voice.lang.startsWith(languageCode)
        );
      }
      
      // If we found a matching voice, use it
      if (matchingVoice) {
        speakRef.current.voice = matchingVoice;
      }
      
      // Let's add a delay to make sure the speech synthesis is ready
      setTimeout(() => {
        window.speechSynthesis.speak(speakRef.current);
      }, 100);
    }
  }, [language]);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }, []);

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    speak,
    pause,
    resume,
    cancel
  };
};
