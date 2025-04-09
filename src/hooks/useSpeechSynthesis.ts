
import { useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseSpeechSynthesisProps {
  onEnd?: () => void;
  rate?: number;
  pitch?: number;
}

let voiceIndex = 0;

export const useSpeechSynthesis = ({
  onEnd,
  rate = 0.85,
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
      console.log('Available voices:', voices.map(voice => `${voice.lang}, ${voice.name}`));
      const languageCode = language === 'en' ? 'en' : 'fr';
      const countryName = language === 'en' ? 'Great Britain' : 'France';


      // First try to find a non-local service voice with exact language match
      const matchingVoices = voices.filter(voice =>
        voice.lang.startsWith(languageCode) && !voice.localService && voice.name.includes(countryName)
      );

      console.log('Matching voices:', matchingVoices.length);
      let matchingVoice: SpeechSynthesisVoice | undefined;
      if (matchingVoices.length > 0) {
        matchingVoice = matchingVoices[voiceIndex % matchingVoices.length];
      }

      // If no matching non-local voice, try any voice with the language
      if (!matchingVoice) {
        matchingVoice = voices.find(voice =>
          voice.lang.startsWith(languageCode)
        );
      }

      // If we found a matching voice, use it
      if (matchingVoice) {
        speakRef.current.voice = matchingVoice;
        console.log('Using voice:', matchingVoice.name, 'of index:', voiceIndex);
        voiceIndex++;
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
