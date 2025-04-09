
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface SpeechVoice {
  name: string;
  lang: string;
  voiceURI: string;
}

interface VoiceSelectorProps {
  disabled?: boolean;
}

// Recommended voices for each language
const RECOMMENDED_VOICES = {
  en: ['English (Great Britain)+croak'],
  fr: ['French (France)+male4']
};

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ disabled = false }) => {
  const { language, t, selectedVoice, setSelectedVoice } = useLanguage();
  const [availableVoices, setAvailableVoices] = useState<SpeechVoice[]>([]);
  const [recommendedVoices, setRecommendedVoices] = useState<SpeechVoice[]>([]);
  const [otherVoices, setOtherVoices] = useState<SpeechVoice[]>([]);

  // Update available voices when language or window.speechSynthesis changes
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const languageCode = language === 'en' ? 'en' : 'fr';
        
        // Filter voices for the current language
        const languageVoices = voices.filter(voice => 
          voice.lang.startsWith(languageCode)
        );
        
        // Separate recommended voices from other voices
        const recommended = languageVoices.filter(voice => 
          RECOMMENDED_VOICES[language]?.includes(voice.voiceURI)
        );
        
        const others = languageVoices.filter(voice => 
          !RECOMMENDED_VOICES[language]?.includes(voice.voiceURI)
        );
        
        setRecommendedVoices(recommended);
        setOtherVoices(others);
        setAvailableVoices(languageVoices);
        
        // If we have a saved voice for this language, use it
        const savedVoice = localStorage.getItem(`story-voice-${language}`);
        if (savedVoice && languageVoices.some(v => v.voiceURI === savedVoice)) {
          setSelectedVoice(savedVoice);
        } else if (recommended.length > 0) {
          // If recommended voice is available, use it
          setSelectedVoice(recommended[0].voiceURI);
          localStorage.setItem(`story-voice-${language}`, recommended[0].voiceURI);
        } else if (languageVoices.length > 0) {
          // Otherwise select the first available voice
          setSelectedVoice(languageVoices[0].voiceURI);
          localStorage.setItem(`story-voice-${language}`, languageVoices[0].voiceURI);
        }
      }
    };

    // Initial voice load
    updateVoices();

    // Set up listener for when voices are changed or loaded
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [language, setSelectedVoice]);

  return (
    <div className="space-y-2">
      <Label htmlFor="voice-select">{t('Voice', 'Voix')}</Label>
      <Select 
        value={selectedVoice || ''} 
        onValueChange={setSelectedVoice} 
        disabled={disabled}
      >
        <SelectTrigger id="voice-select">
          <SelectValue placeholder={t('Select a voice', 'Choisir une voix')} />
        </SelectTrigger>
        <SelectContent>
          {/* Display recommended voices first */}
          {recommendedVoices.length > 0 && (
            <>
              {recommendedVoices.map((voice) => (
                <SelectItem key={voice.voiceURI} value={voice.voiceURI} className="flex items-center">
                  <div>{voice.name} <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    {t('Recommended', 'Recommandée')}
                  </span></div>
                </SelectItem>
              ))}
              {otherVoices.length > 0 && <div className="h-px bg-gray-200 my-1" />}
            </>
          )}
          
          {/* Display other voices */}
          {otherVoices.map((voice) => (
            <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name}
            </SelectItem>
          ))}
          
          {availableVoices.length === 0 && (
            <SelectItem value="none" disabled>
              {t('No voices available', 'Aucune voix disponible')}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VoiceSelector;
