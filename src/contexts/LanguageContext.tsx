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
  const [language, setLanguage] = useState<Language>('fr'); // Default to French
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

    // Load saved voice preference for the current language
    const savedVoice = localStorage.getItem(`story-voice-${savedLanguage || 'fr'}`);
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
  }, []);

  // When language changes, load the appropriate voice for that language
  useEffect(() => {
    const savedVoice = localStorage.getItem(`story-voice-${language}`);
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    } else {
      // If no voice is saved for this language, we'll keep the current voice
      // The SettingsDialog component will handle setting a default voice if needed
    }
  }, [language]);

  // Simple translation function that selects text based on current language
  const t = (en: string, fr: string): string => {
    return language === 'en' ? en : fr;
  };

  const handleSetSelectedVoice = (voiceURI: string) => {
    setSelectedVoice(voiceURI);
    localStorage.setItem(`story-voice-${language}`, voiceURI);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t,
      selectedVoice,
      setSelectedVoice: handleSetSelectedVoice
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
