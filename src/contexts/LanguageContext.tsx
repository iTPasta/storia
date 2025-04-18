
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, fr: string) => string;
  selectedVoice: string | null;
  setSelectedVoice: (voiceURI: string) => void;
}

const DEFAULT_VOICE = 'nova';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');
  const [selectedVoice, setSelectedVoice] = useState<string | null>(DEFAULT_VOICE);

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
    } else {
      setSelectedVoice(DEFAULT_VOICE);
      localStorage.setItem('story-voice', DEFAULT_VOICE);
    }
  }, []);

  const t = (en: string, fr: string): string => {
    return language === 'en' ? en : fr;
  };

  const handleSetSelectedVoice = (voiceURI: string) => {
    setSelectedVoice(voiceURI);
    localStorage.setItem('story-voice', voiceURI);
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      selectedVoice,
      setSelectedVoice: handleSetSelectedVoice,
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
