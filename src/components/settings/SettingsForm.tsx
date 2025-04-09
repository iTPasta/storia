
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitch from './LanguageSwitch';
import VoiceSelector from './VoiceSelector';

interface SettingsFormProps {
  disabled?: boolean;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ disabled = false }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 py-4">
      {/* Language Switch */}
      <LanguageSwitch disabled={disabled} />
      
      {/* Voice Selection, Rate and Pitch */}
      <VoiceSelector disabled={disabled} />
    </div>
  );
};

export default SettingsForm;
