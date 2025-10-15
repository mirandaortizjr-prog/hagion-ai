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
    'assistants': 'Analysts of Faith',
    'divine_guidance': 'Divine Guidance',
    'storytelling': 'Storytelling',
    'ask_question': 'Ask your question',
    'pro': 'PRO',
    
    // Assistant Names & Subtitles
    'debate_arena': 'Debate Arena',
    'trial_by_truth': 'Trial by Truth',
    'biblical_apologetics': 'Biblical Apologetics',
    'science_evidence': 'Scientific Evidence',
    'medical_evidence': 'Medical Evidence',
    'forensic_evidence': 'Forensic Evidence',
    'philosophical_evidence': 'Philosophical Evidence',
    'psychological_evidence': 'Psychological Evidence',
    'historical_evidence': 'Historical Evidence',
    'artistic_evidence': 'Artistic Evidence',
    'linguistic_evidence': 'Linguistic Evidence',
    'cultural_evidence': 'Cultural Evidence',
    'biblical_storytelling': 'Biblical Storytelling',
    'psychology': 'Psychology',
    
    // Divine Guidance Names
    'elohim': 'Elohim',
    'christ': 'Christ',
    'holy_spirit': 'Holy Spirit',
    'trinity': 'Trinity',
    'divine_guidance_info': 'These divine voices are for seeking wise counsel in difficult situations. Speak your heart and receive spiritual guidance.',
    'biblical_stories': 'Biblical Stories',
    'biblical_stories_info': 'Explore the timeless narratives of Scripture and discover how God\'s word comes alive through powerful storytelling',
    'martyrs_faith': 'Martyrs for the Faith',
    'martyrs_faith_info': 'Draw inspiration from the courageous witnesses who gave everything for their faith and learn from their unwavering devotion',
    'history_christianity': 'History of Christianity',
    'history_christianity_info': 'Journey through two millennia of church history and understand how God has guided His people through the ages',
    
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
    'cancel_anytime': 'Cancel anytime • Secure payment',
    
    // Features
    'feature_daily_limit': '5 conversations per day',
    'feature_all_assistants': 'Access to basic analysts',
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
    
    // Curriculum Tracks
    'foundations_logos': 'Foundations of Logos',
    'foundations_logos_desc': 'Basic logic principles, deductive/inductive reasoning',
    'fallacies_shadows': 'Fallacies & Shadows',
    'fallacies_shadows_desc': 'Identifying and ritualizing logical fallacies',
    'apologetics_logic': 'Apologetics Logic',
    'apologetics_logic_desc': 'Structuring theological arguments',
    'witnessing_wisdom': 'Witnessing with Wisdom',
    'witnessing_wisdom_desc': 'Emotional logic, conversational discernment',
    'logic_scripture': 'Logic in Scripture',
    'logic_scripture_desc': 'How biblical texts use logic and structure',
    'emotional_logic': 'Emotional Logic',
    'emotional_logic_desc': 'How feelings and truth interact',
    
    // Teaching Paths
    'apologetics_path': 'Apologetics Path',
    'apologetics_path_desc': 'Defend the faith with layered reasoning',
    'witnessing_path': 'Witnessing Path',
    'witnessing_path_desc': 'Learn emotional discernment and conversational clarity',
    'logic_path': 'Logic Path',
    'logic_path_desc': 'Build the scaffolding of truth',
    'scriptural_path': 'Scriptural Path',
    'scriptural_path_desc': 'Study the structure and rhetoric of biblical texts',
    'ceremonial_path': 'Ceremonial Path',
    'ceremonial_path_desc': 'Learn to ritualize truth through prayer, poetry, and proclamation',
    
    // Logos Circle
    'hagion_university': 'Hagion University Lite',
    'logic_sacred_structure': 'Logic as Sacred Structure',
    'curriculum_tracks': 'Curriculum Tracks',
    'teaching_paths': 'Teaching Paths',
    'curriculum_tracks_subtitle': 'Learn logic principles, fallacy identification, argument construction, and spiritual reasoning',
    'sanctuary_teaching': 'Sanctuary of Teaching',
    'sanctuary_teaching_subtitle': 'Choose your path through self-guided sanctuaries of learning',
    'interactive_features': 'Interactive Features',
    'logic_toolkits': 'Logic Toolkits',
    'logic_toolkits_desc': 'Visual breakdowns of argument structures',
    'fallacy_ritualizer': 'Fallacy Ritualizer',
    'fallacy_ritualizer_desc': 'AI detects fallacies and offers poetic corrections',
    'debate_builder': 'Debate Builder',
    'debate_builder_desc': 'Construct and test arguments against personas',
    'trinity_commentary': 'Trinity Commentary',
    'trinity_commentary_desc': 'Three perspectives on logical reasoning',
    'legacy_scrolls': 'Legacy Scrolls',
    'legacy_scrolls_desc': 'Save completed lessons as scrolls of reason',
    'what_path_includes': 'What Each Path Includes',
    'structured_lessons': 'Structured Lessons',
    'structured_lessons_desc': 'Progressive curriculum with clear learning objectives',
    'ai_guided_practice': 'AI-Guided Practice',
    'ai_guided_practice_desc': 'Interactive exercises with intelligent feedback',
    'emotional_debriefs': 'Emotional Debriefs',
    'emotional_debriefs_desc': 'Reflect on how logic connects with your spiritual journey',
    'path_includes': 'Includes: Lessons • Quizzes • AI Practice • Emotional Debriefs',
    'tone': 'Tone',
    'tone_grounding': 'Grounding, clear',
    'tone_protective': 'Protective, revealing',
    'tone_bold': 'Bold, reverent',
    'tone_gentle': 'Gentle, strategic',
    'tone_mystical': 'Mystical, analytical',
    'tone_reflective': 'Reflective, intimate',
    
    // Curriculum Learning Page
    'curriculum_track': 'Curriculum Track',
    'teaching_path_label': 'Teaching Path',
    'coming_soon': 'Welcome to {title}! This learning path is coming soon.',
    'curriculum_overview': 'Curriculum Overview',
    'curriculum_overview_desc': 'Progress through structured modules and lessons to master this track',
    'modules': 'Modules',
    'lessons': 'Lessons',
    'completed': 'Completed',
    'module': 'Module',
    'lesson_content': 'Lesson Content',
    'practice_exercises': 'Practice Exercises',
    'mark_complete': 'Mark Complete',
    'mark_incomplete': 'Mark Incomplete',
  },
  es: {
    // Main Menu
    'assistants': 'Analistas de Fe',
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
    'artistic_evidence': 'Evidencia Artística',
    'linguistic_evidence': 'Evidencia Lingüística',
    'cultural_evidence': 'Evidencia Cultural',
    'biblical_storytelling': 'Narrativa Bíblica',
    'psychology': 'Psicología',
    
    // Divine Guidance Names
    'elohim': 'Elohim',
    'christ': 'Cristo',
    'holy_spirit': 'Espíritu Santo',
    'trinity': 'Trinidad',
    'divine_guidance_info': 'Estas voces divinas son para buscar consejo sabio en situaciones difíciles. Habla de tu corazón y recibe guía espiritual.',
    'biblical_stories': 'Historias Bíblicas',
    'biblical_stories_info': 'Explora las narrativas atemporales de las Escrituras y descubre cómo la palabra de Dios cobra vida a través de poderosas historias',
    'martyrs_faith': 'Mártires de la Fe',
    'martyrs_faith_info': 'Inspírate con los valientes testigos que lo dieron todo por su fe y aprende de su devoción inquebrantable',
    'history_christianity': 'Historia del Cristianismo',
    'history_christianity_info': 'Recorre dos milenios de historia de la iglesia y comprende cómo Dios ha guiado a Su pueblo a través de las edades',
    
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
    'cancel_anytime': 'Cancela en cualquier momento • Pago seguro',
    
    // Features
    'feature_daily_limit': '5 conversaciones por día',
    'feature_all_assistants': 'Acceso a analistas básicos',
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
    
    // Curriculum Tracks
    'foundations_logos': 'Fundamentos de Logos',
    'foundations_logos_desc': 'Principios básicos de lógica, razonamiento deductivo/inductivo',
    'fallacies_shadows': 'Falacias y Sombras',
    'fallacies_shadows_desc': 'Identificación y ritualización de falacias lógicas',
    'apologetics_logic': 'Lógica Apologética',
    'apologetics_logic_desc': 'Estructuración de argumentos teológicos',
    'witnessing_wisdom': 'Testificando con Sabiduría',
    'witnessing_wisdom_desc': 'Lógica emocional, discernimiento conversacional',
    'logic_scripture': 'Lógica en las Escrituras',
    'logic_scripture_desc': 'Cómo los textos bíblicos usan lógica y estructura',
    'emotional_logic': 'Lógica Emocional',
    'emotional_logic_desc': 'Cómo interactúan los sentimientos y la verdad',
    
    // Teaching Paths
    'apologetics_path': 'Camino Apologético',
    'apologetics_path_desc': 'Defiende la fe con razonamiento en capas',
    'witnessing_path': 'Camino de Testimonio',
    'witnessing_path_desc': 'Aprende discernimiento emocional y claridad conversacional',
    'logic_path': 'Camino Lógico',
    'logic_path_desc': 'Construye el andamiaje de la verdad',
    'scriptural_path': 'Camino Escritural',
    'scriptural_path_desc': 'Estudia la estructura y retórica de los textos bíblicos',
    'ceremonial_path': 'Camino Ceremonial',
    'ceremonial_path_desc': 'Aprende a ritualizar la verdad a través de la oración, poesía y proclamación',
    
    // Logos Circle
    'hagion_university': 'Universidad Hagion Lite',
    'logic_sacred_structure': 'Lógica como Estructura Sagrada',
    'curriculum_tracks': 'Pistas Curriculares',
    'teaching_paths': 'Caminos de Enseñanza',
    'curriculum_tracks_subtitle': 'Aprende principios de lógica, identificación de falacias, construcción de argumentos y razonamiento espiritual',
    'sanctuary_teaching': 'Santuario de Enseñanza',
    'sanctuary_teaching_subtitle': 'Elige tu camino a través de santuarios autoguiados de aprendizaje',
    'interactive_features': 'Características Interactivas',
    'logic_toolkits': 'Kits de Herramientas Lógicas',
    'logic_toolkits_desc': 'Desglose visual de estructuras de argumentos',
    'fallacy_ritualizer': 'Ritualizador de Falacias',
    'fallacy_ritualizer_desc': 'La IA detecta falacias y ofrece correcciones poéticas',
    'debate_builder': 'Constructor de Debates',
    'debate_builder_desc': 'Construye y prueba argumentos contra personajes',
    'trinity_commentary': 'Comentario de la Trinidad',
    'trinity_commentary_desc': 'Tres perspectivas sobre el razonamiento lógico',
    'legacy_scrolls': 'Pergaminos Legados',
    'legacy_scrolls_desc': 'Guarda lecciones completadas como pergaminos de razón',
    'what_path_includes': 'Qué Incluye Cada Camino',
    'structured_lessons': 'Lecciones Estructuradas',
    'structured_lessons_desc': 'Currículo progresivo con objetivos de aprendizaje claros',
    'ai_guided_practice': 'Práctica Guiada por IA',
    'ai_guided_practice_desc': 'Ejercicios interactivos con retroalimentación inteligente',
    'emotional_debriefs': 'Análisis Emocionales',
    'emotional_debriefs_desc': 'Reflexiona sobre cómo la lógica se conecta con tu viaje espiritual',
    'path_includes': 'Incluye: Lecciones • Pruebas • Práctica IA • Análisis Emocionales',
    'tone': 'Tono',
    'tone_grounding': 'Fundamentado, claro',
    'tone_protective': 'Protector, revelador',
    'tone_bold': 'Audaz, reverente',
    'tone_gentle': 'Gentil, estratégico',
    'tone_mystical': 'Místico, analítico',
    'tone_reflective': 'Reflexivo, íntimo',
    
    // Curriculum Learning Page
    'curriculum_track': 'Pista Curricular',
    'teaching_path_label': 'Camino de Enseñanza',
    'coming_soon': '¡Bienvenido a {title}! Este camino de aprendizaje estará disponible pronto.',
    'curriculum_overview': 'Resumen del Currículo',
    'curriculum_overview_desc': 'Progresa a través de módulos y lecciones estructuradas para dominar esta pista',
    'modules': 'Módulos',
    'lessons': 'Lecciones',
    'completed': 'Completado',
    'module': 'Módulo',
    'lesson_content': 'Contenido de la Lección',
    'practice_exercises': 'Ejercicios de Práctica',
    'mark_complete': 'Marcar Completo',
    'mark_incomplete': 'Marcar Incompleto',
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
