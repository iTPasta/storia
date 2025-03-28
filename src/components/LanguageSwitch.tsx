
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface LanguageSwitchProps {
  disabled?: boolean;
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ disabled = false }) => {
  const { language, setLanguage, t } = useLanguage();
  
  const handleToggle = (checked: boolean) => {
    setLanguage(checked ? 'fr' : 'en');
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="language-switch" className={`text-sm font-medium ${disabled ? 'opacity-50' : ''}`}>
        {t('English', 'Anglais')}
      </Label>
      <Switch 
        id="language-switch" 
        checked={language === 'fr'}
        onCheckedChange={handleToggle}
        disabled={disabled}
      />
      <Label htmlFor="language-switch" className={`text-sm font-medium ${disabled ? 'opacity-50' : ''}`}>
        {t('French', 'Français')}
      </Label>
    </div>
  );
};

export default LanguageSwitch;
