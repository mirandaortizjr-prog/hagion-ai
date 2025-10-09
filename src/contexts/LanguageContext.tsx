import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'chat': 'Chat',
    'prompts': 'Prompts',
    'history': 'History',
    'type_message': 'Type your message...',
    'send': 'Send',
    'guidance_disclaimer': 'This guidance is based on biblical principles. For personal matters, consider consulting with a spiritual advisor.',
  },
  es: {
    'chat': 'Chat',
    'prompts': 'Prompts',
    'history': 'Historial',
    'type_message': 'Escribe tu mensaje...',
    'send': 'Enviar',
    'guidance_disclaimer': 'Esta guía se basa en principios bíblicos. Para asuntos personales, considere consultar con un asesor espiritual.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
