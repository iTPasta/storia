
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import PasswordForm from './settings/PasswordForm';
import SettingsForm from './settings/SettingsForm';

interface SettingsDialogProps {
  disabled?: boolean;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ disabled = false }) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  
  const AUTO_CLOSE_TIME = 15; // seconds

  const handleAuthenticate = () => {
    setAuthenticated(true);
  };

  const handleAuthFail = () => {
    setOpen(false);
  };

  const handleDialogClose = () => {
    setAuthenticated(false);
  };

  return (
    <div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpen(true)} 
        disabled={disabled}
        aria-label={t('Settings', 'Paramètres')}
      >
        <Settings className="h-6 w-6" />
      </Button>

      <Dialog 
        open={open} 
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) handleDialogClose();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authenticated 
                ? t('Settings', 'Paramètres') 
                : t('Enter Password', 'Entrez le mot de passe')}
            </DialogTitle>
          </DialogHeader>

          {!authenticated ? (
            <PasswordForm 
              onAuthenticate={handleAuthenticate}
              onFail={handleAuthFail}
              autoCloseTime={AUTO_CLOSE_TIME}
            />
          ) : (
            <SettingsForm disabled={disabled} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsDialog;
