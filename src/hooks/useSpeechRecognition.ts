
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  lang?: string;
}

export const useSpeechRecognition = ({ onResult, lang }: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  // If no explicit language is provided, use the current app language
  const recognitionLang = lang || (language === 'en' ? 'en-US' : 'fr-FR');

  const startListening = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Use the appropriate SpeechRecognition constructor
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      
      recognition.lang = recognitionLang;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setIsListening(false);
        onResult(speechResult);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: t("Voice recognition error", "Erreur de reconnaissance vocale"),
          description: t("Please try again or type the story name", "Veuillez réessayer ou taper le nom de l'histoire"),
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
        title: t("Voice recognition not supported", "Reconnaissance vocale non prise en charge"),
        description: t("Your browser doesn't support voice recognition", "Votre navigateur ne prend pas en charge la reconnaissance vocale"),
        variant: "destructive"
      });
    }
  };

  return {
    isListening,
    startListening
  };
};
