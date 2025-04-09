
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSwitchProps {
  disabled?: boolean;
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ disabled = false }) => {
  const { language, setLanguage, t } = useLanguage();
  
  const handleLanguageChange = (checked: boolean) => {
    if (disabled) return;
    const newLanguage = checked ? 'fr' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('story-language', newLanguage);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor="language-switch">{t('Language', 'Langue')}</Label>
        <p className="text-sm text-muted-foreground">
          {t('Switch between English and French', 'Basculer entre l\'anglais et le français')}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`text-sm ${language === 'fr' ? 'font-medium' : 'text-muted-foreground'}`}>
          {t('English', 'Anglais')}
        </span>
        <Switch 
          id="language-switch" 
          checked={language === 'fr'}
          onCheckedChange={handleLanguageChange}
          disabled={disabled}
        />
        <span className={`text-sm ${language === 'fr' ? 'text-muted-foreground' : 'font-medium'}`}>
          {t('French', 'Français')}
        </span>
      </div>
    </div>
  );
};

export default LanguageSwitch;
