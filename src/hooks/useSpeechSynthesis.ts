
import { useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface UseSpeechSynthesisProps {
  onEnd?: () => void;
}

export const useSpeechSynthesis = ({ onEnd }: UseSpeechSynthesisProps = {}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { selectedVoice, rate } = useLanguage();

  useEffect(() => {
    audioRef.current = new Audio();
    if (onEnd) {
      audioRef.current.onended = onEnd;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current = null;
      }
    };
  }, [onEnd]);

  const speak = useCallback(async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text,
          voice: selectedVoice || 'alloy'
        }
      });

      if (error) throw error;
      if (!data?.audioContent) throw new Error('No audio content received');

      if (audioRef.current) {
        audioRef.current.playbackRate = rate;
        audioRef.current.src = `data:audio/mp3;base64,${data.audioContent}`;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error in speech synthesis:', error);
    }
  }, [selectedVoice, rate]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, []);

  const cancel = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return {
    speak,
    pause,
    resume,
    cancel
  };
};
