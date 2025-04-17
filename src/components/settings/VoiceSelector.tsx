
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { Slider } from '@/components/ui/slider';

interface VoiceSelectorProps {
  disabled?: boolean;
}

// Available OpenAI voices
const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy' },
  { id: 'echo', name: 'Echo' },
  { id: 'fable', name: 'Fable' },
  { id: 'onyx', name: 'Onyx' },
  { id: 'nova', name: 'Nova' },
  { id: 'shimmer', name: 'Shimmer' }
];

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ disabled = false }) => {
  const { language, t, selectedVoice, setSelectedVoice, rate, setRate, pitch, setPitch } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voice-select">{t('Voice', 'Voix')}</Label>
        <Select
          value={selectedVoice || 'alloy'}
          onValueChange={setSelectedVoice}
          disabled={disabled}
        >
          <SelectTrigger id="voice-select">
            <SelectValue placeholder={t('Select a voice', 'Choisir une voix')} />
          </SelectTrigger>
          <SelectContent>
            {OPENAI_VOICES.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rate Slider */}
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
          onValueChange={(values) => setRate(values[0])}
          disabled={disabled}
          className="py-2"
        />
      </div>

      {/* Pitch Slider */}
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
          onValueChange={(values) => setPitch(values[0])}
          disabled={disabled}
          className="py-2"
        />
      </div>
    </div>
  );
};

export default VoiceSelector;
