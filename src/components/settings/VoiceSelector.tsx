
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { Slider } from '@/components/ui/slider';

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
  fr: ['French (France)+male4', 'French (Switzerland)+Zac']
};

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ disabled = false }) => {
  const { language, t, selectedVoice, setSelectedVoice, rate, setRate, pitch, setPitch } = useLanguage();
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
          RECOMMENDED_VOICES[language]?.includes(voice.name)
        );

        const others = languageVoices.filter(voice =>
          !RECOMMENDED_VOICES[language]?.includes(voice.name)
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
    <div className="space-y-4">
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
      
      {/* Speech Rate Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="rate-slider">{t('Speech Rate', 'Vitesse de parole')}</Label>
          <span className="text-sm text-muted-foreground">{rate.toFixed(1)}</span>
        </div>
        <Slider
          id="rate-slider"
          min={0.1}
          max={2.0}
          step={0.1}
          value={[rate]}
          onValueChange={(values) => {
            setRate(values[0]);
            localStorage.setItem('speech-rate', values[0].toString());
          }}
          disabled={disabled}
          className="py-2"
        />
      </div>
      
      {/* Speech Pitch Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="pitch-slider">{t('Speech Pitch', 'Hauteur de voix')}</Label>
          <span className="text-sm text-muted-foreground">{pitch.toFixed(1)}</span>
        </div>
        <Slider
          id="pitch-slider"
          min={0.1}
          max={2.0}
          step={0.1}
          value={[pitch]}
          onValueChange={(values) => {
            setPitch(values[0]);
            localStorage.setItem('speech-pitch', values[0].toString());
          }}
          disabled={disabled}
          className="py-2"
        />
      </div>
    </div>
  );
};

export default VoiceSelector;
