
import { useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseSpeechSynthesisProps {
  onEnd?: () => void;
  rate?: number;
  pitch?: number;
}

export const useSpeechSynthesis = ({
  onEnd,
  rate = 0.85,
  pitch = 1.2
}: UseSpeechSynthesisProps = {}) => {
  const speakRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { language, selectedVoice } = useLanguage();

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

      // Try to find the selected voice or a suitable fallback
      const voices = window.speechSynthesis.getVoices();
      console.log('Available voices:', voices.map(voice => `${voice.lang}, ${voice.name}, ${voice.voiceURI}`));
      
      let voiceToUse: SpeechSynthesisVoice | undefined;
      
      // First try to use the selected voice if available
      if (selectedVoice) {
        voiceToUse = voices.find(voice => voice.voiceURI === selectedVoice);
        if (voiceToUse) {
          console.log(`Using selected voice: ${voiceToUse.name}`);
        }
      }

      // If no selected voice or not found, use language-based fallback
      if (!voiceToUse) {
        const languageCode = language === 'en' ? 'en' : 'fr';
        
        // Try to find a voice with exact language match
        const matchingVoices = voices.filter(voice =>
          voice.lang.startsWith(languageCode)
        );

        if (matchingVoices.length > 0) {
          voiceToUse = matchingVoices[0];
          console.log(`Using language-matched voice: ${voiceToUse.name}`);
        } else {
          // If no matching voice, use any available voice
          voiceToUse = voices[0];
          console.log(`Using fallback voice: ${voiceToUse?.name}`);
        }
      }

      // If we found a voice, use it
      if (voiceToUse) {
        speakRef.current.voice = voiceToUse;
      }

      // Let's add a delay to make sure the speech synthesis is ready
      setTimeout(() => {
        window.speechSynthesis.speak(speakRef.current);
      }, 100);
    }
  }, [language, selectedVoice]);

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
