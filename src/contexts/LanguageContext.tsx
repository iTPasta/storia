
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, fr: string) => string;
  selectedVoice: string | null;
  setSelectedVoice: (voiceURI: string) => void;
  rate: number;
  setRate: (rate: number) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');
  const [selectedVoice, setSelectedVoice] = useState<string | null>('alloy'); // Default to alloy voice
  const [rate, setRate] = useState<number>(1.0); // Default speech rate

  useEffect(() => {
    const savedLanguage = localStorage.getItem('story-language');
    if (savedLanguage === 'en' || savedLanguage === 'fr') {
      setLanguage(savedLanguage);
    } else {
      setLanguage('fr');
      localStorage.setItem('story-language', 'fr');
    }

    const savedVoice = localStorage.getItem('story-voice');
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }

    const savedRate = localStorage.getItem('speech-rate');
    if (savedRate) {
      setRate(parseFloat(savedRate));
    }
  }, []);

  const t = (en: string, fr: string): string => {
    return language === 'en' ? en : fr;
  };

  const handleSetSelectedVoice = (voiceURI: string) => {
    setSelectedVoice(voiceURI);
    localStorage.setItem('story-voice', voiceURI);
  };

  const handleSetRate = (newRate: number) => {
    setRate(newRate);
    localStorage.setItem('speech-rate', newRate.toString());
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      selectedVoice,
      setSelectedVoice: handleSetSelectedVoice,
      rate,
      setRate: handleSetRate,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
