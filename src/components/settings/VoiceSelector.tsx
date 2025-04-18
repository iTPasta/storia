
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceSelectorProps {
  disabled?: boolean;
}

// Available OpenAI voices with descriptions
const getVoiceDescription = (voiceId: string, language: 'en' | 'fr') => {
  const descriptions: Record<string, { en: string; fr: string }> = {
    'nova': {
      en: 'Energetic, youthful voice - Perfect for children\'s stories',
      fr: 'Voix énergique et jeune - Parfaite pour les histoires d\'enfants'
    },
    'alloy': {
      en: 'Versatile, balanced voice',
      fr: 'Voix polyvalente et équilibrée'
    },
    'echo': {
      en: 'Warm, natural voice',
      fr: 'Voix chaleureuse et naturelle'
    },
    'fable': {
      en: 'British-accented, gentle voice',
      fr: 'Voix douce avec accent britannique'
    },
    'onyx': {
      en: 'Deep, resonant voice',
      fr: 'Voix profonde et résonnante'
    },
    'shimmer': {
      en: 'Clear, melodic voice',
      fr: 'Voix claire et mélodieuse'
    },
    'ash': {
      en: 'Approachable, professional voice',
      fr: 'Voix accessible et professionnelle'
    },
    'sage': {
      en: 'Mature, thoughtful voice',
      fr: 'Voix mature et réfléchie'
    },
    'coral': {
      en: 'Cheerful, bright voice',
      fr: 'Voix joyeuse et lumineuse'
    }
  };
  return descriptions[voiceId][language];
};

const OPENAI_VOICES = [
  'nova', // Recommended for children's stories
  'shimmer',
  'echo',
  'fable',
  'coral',
  'alloy',
  'ash',
  'sage',
  'onyx'
];

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ disabled = false }) => {
  const { language, t, selectedVoice, setSelectedVoice } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voice-select">{t('Voice', 'Voix')}</Label>
        <Select
          value={selectedVoice || 'nova'}
          onValueChange={setSelectedVoice}
          disabled={disabled}
        >
          <SelectTrigger id="voice-select">
            <SelectValue placeholder={t('Select a voice', 'Choisir une voix')} />
          </SelectTrigger>
          <SelectContent>
            {OPENAI_VOICES.map((voiceId) => (
              <SelectItem key={voiceId} value={voiceId}>
                {voiceId} - {getVoiceDescription(voiceId, language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default VoiceSelector;
