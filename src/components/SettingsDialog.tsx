import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface SettingsDialogProps {
  disabled?: boolean;
}

interface SpeechVoice {
  name: string;
  lang: string;
  voiceURI: string;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ disabled = false }) => {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  
  const CORRECT_PASSWORD = 'qtrobot2025';
  const AUTO_CLOSE_TIME = 15; // seconds

  useEffect(() => {
    // Load saved preferences from local storage
    const savedLanguage = localStorage.getItem('story-language');
    if (savedLanguage === 'en' || savedLanguage === 'fr') {
      setLanguage(savedLanguage);
    } else {
      // Default to French if no preference is saved
      setLanguage('fr');
      localStorage.setItem('story-language', 'fr');
    }
    
    const savedVoice = localStorage.getItem(`story-voice-${language}`);
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
  }, []);

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
        
        setAvailableVoices(languageVoices);
        
        // If we have a saved voice for this language, use it
        const savedVoice = localStorage.getItem(`story-voice-${language}`);
        if (savedVoice && languageVoices.some(v => v.voiceURI === savedVoice)) {
          setSelectedVoice(savedVoice);
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
  }, [language]);

  // Handle dialog open/close
  useEffect(() => {
    if (open && !authenticated) {
      // Start countdown if dialog is open and not authenticated
      setCountdown(AUTO_CLOSE_TIME);
    } else if (!open) {
      // Reset authentication and password when dialog is closed
      setAuthenticated(false);
      setPassword('');
      setCountdown(null);
    }
  }, [open, authenticated]);

  // Handle auto-close countdown
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setOpen(false);
    }
  }, [countdown]);

  const handlePasswordSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      setAuthenticated(true);
      setPassword('');
    } else {
      setPassword('');
      setOpen(false);
    }
  };

  const handleLanguageChange = (checked: boolean) => {
    const newLanguage = checked ? 'fr' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('story-language', newLanguage);
  };

  const handleVoiceChange = (voiceURI: string) => {
    setSelectedVoice(voiceURI);
    localStorage.setItem(`story-voice-${language}`, voiceURI);
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authenticated 
                ? t('Settings', 'Paramètres') 
                : t('Enter Password', 'Entrez le mot de passe')}
            </DialogTitle>
          </DialogHeader>

          {!authenticated ? (
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
                {countdown !== null && (
                  <p className="text-sm text-muted-foreground">
                    {t('Dialog will close in', 'La fenêtre se fermera dans')} {countdown} {t('seconds', 'secondes')}
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" onClick={handlePasswordSubmit}>
                  {t('Submit', 'Valider')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Language Switch */}
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
                  />
                  <span className={`text-sm ${language === 'fr' ? 'text-muted-foreground' : 'font-medium'}`}>
                    {t('French', 'Français')}
                  </span>
                </div>
              </div>

              {/* Voice Selection */}
              <div className="space-y-2">
                <Label htmlFor="voice-select">{t('Voice', 'Voix')}</Label>
                <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                  <SelectTrigger id="voice-select">
                    <SelectValue placeholder={t('Select a voice', 'Choisir une voix')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map((voice) => (
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsDialog;
