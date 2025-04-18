
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { Slider } from '@/components/ui/slider';

interface VoiceSelectorProps {
  disabled?: boolean;
}

// Available OpenAI voices with descriptions
const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy', description: 'Versatile, balanced voice' },
  { id: 'echo', name: 'Echo', description: 'Warm, natural voice' },
  { id: 'fable', name: 'Fable', description: 'British-accented, gentle voice' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, resonant voice' },
  { id: 'nova', name: 'Nova', description: 'Energetic, youthful voice' },
  { id: 'shimmer', name: 'Shimmer', description: 'Clear, melodic voice' },
  { id: 'ash', name: 'Ash', description: 'Approachable, professional voice' },
  { id: 'sage', name: 'Sage', description: 'Mature, thoughtful voice' },
  { id: 'coral', name: 'Coral', description: 'Cheerful, bright voice' }
];

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ disabled = false }) => {
  const { language, t, selectedVoice, setSelectedVoice, rate, setRate } = useLanguage();

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
                {voice.name} - {voice.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rate Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="rate-slider">{t('Speech Rate', 'Vitesse de parole')}</Label>
          <span className="text-sm text-muted-foreground">{rate.toFixed(1)}x</span>
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
    </div>
  );
};

export default VoiceSelector;
