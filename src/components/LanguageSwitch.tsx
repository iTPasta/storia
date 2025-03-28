
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const LanguageSwitch: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  
  const handleToggle = (checked: boolean) => {
    setLanguage(checked ? 'fr' : 'en');
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="language-switch" className="text-sm font-medium">
        {t('English', 'Anglais')}
      </Label>
      <Switch 
        id="language-switch" 
        checked={language === 'fr'}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="language-switch" className="text-sm font-medium">
        {t('French', 'Français')}
      </Label>
    </div>
  );
};

export default LanguageSwitch;
