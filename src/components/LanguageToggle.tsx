import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] p-0.5"
    >
      <Languages className="w-3.5 h-3.5 ml-2 text-white/60" />
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={cn(
          'px-3 py-1 text-xs rounded-full transition-colors',
          language === 'en'
            ? 'bg-white text-black font-medium'
            : 'text-white/70 hover:text-white'
        )}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage('es')}
        aria-pressed={language === 'es'}
        className={cn(
          'px-3 py-1 text-xs rounded-full transition-colors',
          language === 'es'
            ? 'bg-white text-black font-medium'
            : 'text-white/70 hover:text-white'
        )}
      >
        Español
      </button>
    </div>
  );
};

export default LanguageToggle;
