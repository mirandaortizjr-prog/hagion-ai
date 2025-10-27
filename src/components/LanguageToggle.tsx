import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
      className="fixed top-4 right-4 z-50 gap-2"
    >
      <Languages className="w-4 h-4" />
      {language === 'en' ? 'English' : 'Español'}
    </Button>
  );
};

export default LanguageToggle;
