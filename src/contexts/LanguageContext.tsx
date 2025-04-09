
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, fr: string) => string;
  selectedVoice: string | null;
  setSelectedVoice: (voiceURI: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  // Load saved language preference on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem('story-language');
    if (savedLanguage === 'en' || savedLanguage === 'fr') {
      setLanguage(savedLanguage);
    } else {
      // Default to French if no preference is saved
      setLanguage('fr');
      localStorage.setItem('story-language', 'fr');
    }

    // Load saved voice preference
    const savedVoice = localStorage.getItem(`story-voice-${savedLanguage || 'fr'}`);
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
  }, []);

  // Simple translation function that selects text based on current language
  const t = (en: string, fr: string): string => {
    return language === 'en' ? en : fr;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t,
      selectedVoice,
      setSelectedVoice
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
