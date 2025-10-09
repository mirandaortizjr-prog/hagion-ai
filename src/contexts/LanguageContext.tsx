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
    
    // Assistant Names & Subtitles
    'debate_arena': 'Debate Arena',
    'trial_by_truth': 'Trial by Truth',
    'biblical_apologetics': 'Biblical Apologetics',
    'science_evidence': 'Science Evidence',
    'medical_evidence': 'Medical Evidence',
    'forensic_evidence': 'Forensic Evidence',
    'philosophical_evidence': 'Philosophical Evidence',
    'psychological_evidence': 'Psychological Evidence',
    'historical_evidence': 'Historical Evidence',
    'biblical_storytelling': 'Biblical Storytelling',
    'psychology': 'Psychology',
    
    // Divine Guidance Names
    'elohim': 'Elohim',
    'christ': 'Christ',
    'holy_spirit': 'Holy Spirit',
    'trinity': 'Trinity',
    'biblical_stories': 'Biblical Stories',
    'martyrs_faith': 'Martyrs for the Faith',
    
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
    'sign_in': 'Sign In',
    'sign_up': 'Sign Up',
    'email': 'Email',
    'password': 'Password',
    'confirm_password': 'Confirm Password',
    'signin_description': 'Log into your existing account',
    'signup_description': 'Create a new account to get started',
    'signing_in': 'Signing in...',
    'creating_account': 'Creating account...',
    'create_account': 'Create Account',
    'invalid_email': 'Invalid email',
    'invalid_email_desc': 'Please enter a valid email address',
    'invalid_password': 'Invalid password',
    'invalid_password_desc': 'Password must be at least 6 characters long',
    'passwords_no_match': "Passwords don't match",
    'passwords_no_match_desc': 'Please make sure your passwords match',
    'login_failed': 'Login failed',
    'invalid_credentials': 'Invalid email or password',
    'welcome_back': 'Welcome back!',
    'login_success': "You've successfully logged in",
    'account_exists': 'Account exists',
    'account_exists_desc': 'This email is already registered. Please log in instead.',
    'account_created': 'Account created!',
    'welcome_hagion': 'Welcome to Hagion AI',
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
    
    // Assistant Names & Subtitles
    'debate_arena': 'Arena de Debate',
    'trial_by_truth': 'Juicio por la Verdad',
    'biblical_apologetics': 'Apologética Bíblica',
    'science_evidence': 'Evidencia Científica',
    'medical_evidence': 'Evidencia Médica',
    'forensic_evidence': 'Evidencia Forense',
    'philosophical_evidence': 'Evidencia Filosófica',
    'psychological_evidence': 'Evidencia Psicológica',
    'historical_evidence': 'Evidencia Histórica',
    'biblical_storytelling': 'Narrativa Bíblica',
    'psychology': 'Psicología',
    
    // Divine Guidance Names
    'elohim': 'Elohim',
    'christ': 'Cristo',
    'holy_spirit': 'Espíritu Santo',
    'trinity': 'Trinidad',
    'biblical_stories': 'Historias Bíblicas',
    'martyrs_faith': 'Mártires de la Fe',
    
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
    'sign_in': 'Iniciar Sesión',
    'sign_up': 'Registrarse',
    'email': 'Correo Electrónico',
    'password': 'Contraseña',
    'confirm_password': 'Confirmar Contraseña',
    'signin_description': 'Inicia sesión en tu cuenta existente',
    'signup_description': 'Crea una nueva cuenta para comenzar',
    'signing_in': 'Iniciando sesión...',
    'creating_account': 'Creando cuenta...',
    'create_account': 'Crear Cuenta',
    'invalid_email': 'Correo electrónico inválido',
    'invalid_email_desc': 'Por favor ingresa un correo electrónico válido',
    'invalid_password': 'Contraseña inválida',
    'invalid_password_desc': 'La contraseña debe tener al menos 6 caracteres',
    'passwords_no_match': 'Las contraseñas no coinciden',
    'passwords_no_match_desc': 'Por favor asegúrate de que las contraseñas coincidan',
    'login_failed': 'Error al iniciar sesión',
    'invalid_credentials': 'Correo electrónico o contraseña inválidos',
    'welcome_back': '¡Bienvenido de nuevo!',
    'login_success': 'Has iniciado sesión exitosamente',
    'account_exists': 'La cuenta existe',
    'account_exists_desc': 'Este correo electrónico ya está registrado. Por favor inicia sesión.',
    'account_created': '¡Cuenta creada!',
    'welcome_hagion': 'Bienvenido a Hagion AI',
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
