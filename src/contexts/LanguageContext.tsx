import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Main Menu
    'assistants': 'Assistants',
    'divine_guidance': 'Divine Guidance',
    'storytelling': 'Storytelling',
    'ask_question': 'Ask your question',
    'pro': 'PRO',
    
    // Navigation
    'chat': 'Chat',
    'saved': 'Saved',
    'history': 'History',
    'save': 'Save',
    
    // Settings
    'settings': 'Settings',
    'account': 'Account',
    'profile': 'Profile',
    'notifications': 'Notifications',
    'preferences': 'Preferences',
    'language_english': 'Language: English',
    'language_spanish': 'Language: Spanish',
    'support': 'Support',
    'help_support': 'Help & Support',
    'log_out': 'Log Out',
    
    // Premium
    'upgrade_premium': 'Upgrade to Premium',
    'unlimited_guidance': 'Unlimited Spiritual Guidance',
    'premium_description': 'Deepen your faith journey with unlimited access to biblically-grounded wisdom and all our spiritual assistants.',
    'free': 'Free',
    'premium': 'Premium',
    'forever': 'Forever',
    'per_month': '/month',
    'or_yearly': 'or $99/year (save 17%)',
    'upgrade_now': 'Upgrade Now',
    'cancel_anytime': 'Cancel anytime • Secure payment • 7-day money-back guarantee',
    
    // Features
    'feature_daily_limit': '5 conversations per day',
    'feature_all_assistants': 'Access to all assistants',
    'feature_basic_scripture': 'Basic Scripture references',
    'feature_unlimited': 'Unlimited conversations',
    'feature_priority': 'Priority response times',
    'feature_saved_history': 'Saved conversation history',
    'feature_advanced_scripture': 'Advanced Scripture insights',
    'feature_offline': 'Offline access to past chats',
    'feature_early_access': 'Early access to new features',
    'feature_ad_free': 'Ad-free experience',
    'feature_support_dev': 'Support development',
    'most_popular': 'MOST POPULAR',
    
    // Chat
    'type_message': 'Type your message...',
    'send': 'Send',
    'guidance_disclaimer': 'All guidance is rooted in Scripture and designed to strengthen your faith',
    'messages_remaining': 'messages remaining today',
    'daily_limit_reached': 'Daily message limit reached',
    'upgrade_unlimited': 'Upgrade to Premium for unlimited conversations',
    'upgrade': 'Upgrade',
    
    // Auth
    'logged_out': 'Logged out',
    'logged_out_success': "You've been successfully logged out",
    'error': 'Error',
    'failed_logout': 'Failed to log out',
  },
  es: {
    // Main Menu
    'assistants': 'Asistentes',
    'divine_guidance': 'Guía Divina',
    'storytelling': 'Historias',
    'ask_question': 'Haz tu pregunta',
    'pro': 'PRO',
    
    // Navigation
    'chat': 'Chat',
    'saved': 'Guardado',
    'history': 'Historial',
    'save': 'Guardar',
    
    // Settings
    'settings': 'Configuración',
    'account': 'Cuenta',
    'profile': 'Perfil',
    'notifications': 'Notificaciones',
    'preferences': 'Preferencias',
    'language_english': 'Idioma: Inglés',
    'language_spanish': 'Idioma: Español',
    'support': 'Soporte',
    'help_support': 'Ayuda y Soporte',
    'log_out': 'Cerrar Sesión',
    
    // Premium
    'upgrade_premium': 'Actualizar a Premium',
    'unlimited_guidance': 'Guía Espiritual Ilimitada',
    'premium_description': 'Profundiza tu camino de fe con acceso ilimitado a sabiduría basada en la Biblia y todos nuestros asistentes espirituales.',
    'free': 'Gratis',
    'premium': 'Premium',
    'forever': 'Para siempre',
    'per_month': '/mes',
    'or_yearly': 'o $99/año (ahorra 17%)',
    'upgrade_now': 'Actualizar Ahora',
    'cancel_anytime': 'Cancela en cualquier momento • Pago seguro • Garantía de devolución de 7 días',
    
    // Features
    'feature_daily_limit': '5 conversaciones por día',
    'feature_all_assistants': 'Acceso a todos los asistentes',
    'feature_basic_scripture': 'Referencias bíblicas básicas',
    'feature_unlimited': 'Conversaciones ilimitadas',
    'feature_priority': 'Tiempos de respuesta prioritarios',
    'feature_saved_history': 'Historial de conversaciones guardado',
    'feature_advanced_scripture': 'Conocimientos bíblicos avanzados',
    'feature_offline': 'Acceso sin conexión a chats anteriores',
    'feature_early_access': 'Acceso anticipado a nuevas funciones',
    'feature_ad_free': 'Experiencia sin anuncios',
    'feature_support_dev': 'Apoya el desarrollo',
    'most_popular': 'MÁS POPULAR',
    
    // Chat
    'type_message': 'Escribe tu mensaje...',
    'send': 'Enviar',
    'guidance_disclaimer': 'Toda la guía está basada en las Escrituras y diseñada para fortalecer tu fe',
    'messages_remaining': 'mensajes restantes hoy',
    'daily_limit_reached': 'Límite diario de mensajes alcanzado',
    'upgrade_unlimited': 'Actualiza a Premium para conversaciones ilimitadas',
    'upgrade': 'Actualizar',
    
    // Auth
    'logged_out': 'Sesión cerrada',
    'logged_out_success': 'Has cerrado sesión exitosamente',
    'error': 'Error',
    'failed_logout': 'Error al cerrar sesión',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'es' || saved === 'en') ? saved : 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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
