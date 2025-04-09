
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface PasswordFormProps {
  onAuthenticate: () => void;
  onFail: () => void;
  autoCloseTime: number;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ 
  onAuthenticate, 
  onFail,
  autoCloseTime
}) => {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [countdown, setCountdown] = useState(autoCloseTime);
  
  const CORRECT_PASSWORD = 'qtrobot2025';

  // Handle auto-close countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      onFail();
    }
  }, [countdown, onFail]);

  const handlePasswordSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      onAuthenticate();
    } else {
      setPassword('');
      onFail();
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="password">{t('Password', 'Mot de passe')}</Label>
        <Input 
          id="password" 
          type="password" 
          placeholder="********" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handlePasswordSubmit();
            }
          }}
        />
        <p className="text-sm text-muted-foreground">
          {t('Dialog will close in', 'La fenêtre se fermera dans')} {countdown} {t('seconds', 'secondes')}
        </p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" onClick={handlePasswordSubmit}>
          {t('Submit', 'Valider')}
        </Button>
      </div>
    </div>
  );
};

export default PasswordForm;
