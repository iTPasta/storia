
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  lang?: string;
}

export const useSpeechRecognition = ({ onResult, lang = 'en-US' }: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const startListening = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Use the appropriate SpeechRecognition constructor
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      
      recognition.lang = lang;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setIsListening(false);
        onResult(speechResult);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice recognition error",
          description: "Please try again or type the story name",
          variant: "destructive"
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setIsListening(true);
      recognition.start();
    } else {
      toast({
        title: "Voice recognition not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
    }
  };

  return {
    isListening,
    startListening
  };
};
