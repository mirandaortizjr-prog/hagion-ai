import { LegalPage } from "@/components/LegalPage";
import { useLanguage } from "@/contexts/LanguageContext";

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const isEs = language === "es";

  return (
    <LegalPage
      title={isEs ? "Política de Privacidad" : "Privacy Policy"}
      lastUpdated={isEs ? "26 de abril, 2026" : "April 26, 2026"}
    >
      {isEs ? <Es /> : <En />}
    </LegalPage>
  );
};

const En = () => (
  <>
    <p>
      This Privacy Policy describes how <strong>Hagion AI</strong> ("Hagion AI," "we," "us," or "our")
      collects, uses, discloses, and protects information when you use our mobile applications,
      websites, and related services (collectively, the "Service"). By accessing or using the Service,
      you consent to the practices described in this Policy.
    </p>

    <h3>1. Information We Collect</h3>
    <h4>a) Information you provide</h4>
    <ul>
      <li><strong>Account data:</strong> name, email address, password (hashed), profile photo, banner image, language preference, and optional gender.</li>
      <li><strong>User content:</strong> prayers, posts, comments, sermon drafts, testimonies, messages, voice recordings, and uploaded media you submit.</li>
      <li><strong>Payment data:</strong> processed by Stripe and Google Play. We do not store full payment card numbers. We store subscription status, plan, billing period, and a customer/subscription identifier.</li>
      <li><strong>Communications:</strong> emails or in-app messages you send to support.</li>
    </ul>
    <h4>b) Information collected automatically</h4>
    <ul>
      <li><strong>Device & usage data:</strong> device type, operating system, app version, IP address, time zone, language, crash logs, error reports, feature usage, and session duration.</li>
      <li><strong>Push tokens:</strong> for sending notifications (you can disable these in device settings).</li>
      <li><strong>Cookies & local storage:</strong> for authentication, session continuity, and preference persistence.</li>
    </ul>
    <h4>c) Information from third parties</h4>
    <ul>
      <li><strong>Authentication providers</strong> (e.g., Google) — basic profile info you authorize.</li>
      <li><strong>Stripe / Google Play</strong> — purchase, subscription, and refund status.</li>
    </ul>

    <h3>2. How We Use Information</h3>
    <ul>
      <li>To operate, maintain, and improve the Service;</li>
      <li>To provide AI responses, devotionals, sermon assistance, and discernment tools you request;</li>
      <li>To process payments, manage subscriptions, and prevent fraud;</li>
      <li>To send transactional emails and (where permitted) service announcements;</li>
      <li>To enforce our Terms of Service, investigate abuse, and ensure community safety;</li>
      <li>To comply with legal obligations and respond to lawful requests.</li>
    </ul>

    <h3>3. AI Processing</h3>
    <p>
      Inputs you submit to AI features (chat, sermon lab, discernment tools, etc.) are processed by
      large language model providers, including Google Gemini and OpenAI, via the Lovable AI
      Gateway. Inputs may be transiently transmitted to and processed by these providers solely to
      generate the response you requested. We do not sell your inputs and we instruct providers not
      to use them to train their models, where such an option is available. <strong>Do not submit
      sensitive personal information, medical details, or confidential third-party data into the
      Service.</strong>
    </p>

    <h3>4. Sharing & Disclosure</h3>
    <p>We share information only as follows:</p>
    <ul>
      <li><strong>Service providers / sub-processors:</strong> Supabase (database, auth, storage), Stripe (payments), Google Play Billing, Google Cloud and OpenAI (AI inference), email and push-notification vendors.</li>
      <li><strong>Public content:</strong> posts, prayers, comments, profile name, and avatar you choose to publish are visible to other users.</li>
      <li><strong>Legal compliance:</strong> when required by law, subpoena, court order, or to protect rights, property, or safety.</li>
      <li><strong>Business transfers:</strong> in connection with a merger, acquisition, financing, or sale of assets.</li>
    </ul>
    <p><strong>We do not sell your personal information.</strong></p>

    <h3>5. Data Retention</h3>
    <p>
      We retain account and content data for as long as your account is active. When you request
      account deletion, your account is scheduled for permanent deletion after a 30-day grace
      period, during which active subscriptions are cancelled at the end of the current billing
      period. Backups are purged within an additional 90 days. Aggregated, de-identified data may
      be retained indefinitely.
    </p>

    <h3>6. Your Rights</h3>
    <p>Depending on your jurisdiction, you may have the right to:</p>
    <ul>
      <li>Access, correct, port, or delete your personal data;</li>
      <li>Opt out of certain processing, including marketing communications;</li>
      <li>Withdraw consent where processing is consent-based;</li>
      <li>Lodge a complaint with a supervisory authority.</li>
    </ul>
    <p>
      <strong>California residents</strong> have additional rights under the CCPA/CPRA, including the
      right to know what categories of personal information are collected and the right to opt out
      of "sharing." <strong>EU/UK residents</strong> have rights under the GDPR/UK GDPR. To exercise any
      right, email <a href="mailto:support@hagionai.com">support@hagionai.com</a>.
    </p>

    <h3>7. Security</h3>
    <p>
      We use industry-standard safeguards including TLS encryption in transit, encryption at rest,
      Row-Level Security in the database, hashed passwords, and least-privilege access. No system
      is perfectly secure; you use the Service at your own risk.
    </p>

    <h3>8. International Transfers</h3>
    <p>
      Hagion AI is operated from the United States. By using the Service, you understand your
      information may be processed in the US and other countries with different data-protection
      laws than your own. Where applicable, transfers rely on Standard Contractual Clauses or
      equivalent safeguards.
    </p>

    <h3>9. Children</h3>
    <p>
      The Service is not directed to children under 13 (or under 16 in the EU/UK). We do not
      knowingly collect personal information from children. If you believe we have collected such
      information, contact us and we will promptly delete it.
    </p>

    <h3>10. Third-Party Links</h3>
    <p>
      The Service may link to third-party sites or services. Their privacy practices are governed
      by their own policies, which we do not control or endorse.
    </p>

    <h3>11. Changes to This Policy</h3>
    <p>
      We may update this Policy from time to time. Material changes will be communicated via the
      Service or by email. Continued use after changes constitutes acceptance.
    </p>

    <h3>12. Contact</h3>
    <p>
      Hagion AI · Texas, United States ·{" "}
      <a href="mailto:support@hagionai.com">support@hagionai.com</a>
    </p>
  </>
);

const Es = () => (
  <>
    <p>
      Esta Política de Privacidad describe cómo <strong>Hagion AI</strong> ("Hagion AI," "nosotros")
      recopila, usa, divulga y protege la información cuando utilizas nuestras aplicaciones móviles,
      sitios web y servicios relacionados (en conjunto, el "Servicio"). Al acceder o utilizar el
      Servicio, aceptas las prácticas descritas en esta Política.
    </p>

    <h3>1. Información que recopilamos</h3>
    <h4>a) Información que tú proporcionas</h4>
    <ul>
      <li><strong>Datos de cuenta:</strong> nombre, correo electrónico, contraseña (encriptada), foto de perfil, imagen de portada, idioma y género opcional.</li>
      <li><strong>Contenido del usuario:</strong> oraciones, publicaciones, comentarios, borradores de sermones, testimonios, mensajes, grabaciones de voz y medios cargados.</li>
      <li><strong>Datos de pago:</strong> procesados por Stripe y Google Play. No almacenamos números completos de tarjetas. Almacenamos estado de suscripción, plan, periodo de facturación e identificadores.</li>
      <li><strong>Comunicaciones:</strong> correos o mensajes en la app que envíes a soporte.</li>
    </ul>
    <h4>b) Información recopilada automáticamente</h4>
    <ul>
      <li><strong>Datos de dispositivo y uso:</strong> tipo de dispositivo, sistema operativo, versión de la app, dirección IP, zona horaria, idioma, registros de fallos, uso de funciones y duración de sesión.</li>
      <li><strong>Tokens push:</strong> para enviar notificaciones (puedes desactivarlas en ajustes del dispositivo).</li>
      <li><strong>Cookies y almacenamiento local:</strong> para autenticación, continuidad de sesión y preferencias.</li>
    </ul>
    <h4>c) Información de terceros</h4>
    <ul>
      <li><strong>Proveedores de autenticación</strong> (p. ej., Google) — información básica de perfil que autorizas.</li>
      <li><strong>Stripe / Google Play</strong> — estado de compra, suscripción y reembolso.</li>
    </ul>

    <h3>2. Cómo usamos la información</h3>
    <ul>
      <li>Para operar, mantener y mejorar el Servicio;</li>
      <li>Para proporcionar respuestas de IA, devocionales, asistencia con sermones y herramientas de discernimiento;</li>
      <li>Para procesar pagos, gestionar suscripciones y prevenir fraudes;</li>
      <li>Para enviar correos transaccionales y, cuando se permita, anuncios del servicio;</li>
      <li>Para hacer cumplir nuestros Términos, investigar abusos y garantizar la seguridad de la comunidad;</li>
      <li>Para cumplir obligaciones legales.</li>
    </ul>

    <h3>3. Procesamiento de IA</h3>
    <p>
      Las entradas que envías a las funciones de IA se procesan mediante modelos de lenguaje grandes
      como Google Gemini y OpenAI, a través del Lovable AI Gateway. Las entradas pueden transmitirse
      temporalmente a estos proveedores únicamente para generar la respuesta solicitada. No vendemos
      tus entradas e instruimos a los proveedores para que no las usen para entrenar sus modelos
      cuando esa opción esté disponible. <strong>No envíes información personal sensible, datos
      médicos, ni datos confidenciales de terceros al Servicio.</strong>
    </p>

    <h3>4. Compartir y divulgar</h3>
    <ul>
      <li><strong>Proveedores de servicios:</strong> Supabase (base de datos, auth, almacenamiento), Stripe (pagos), Google Play Billing, Google Cloud y OpenAI (inferencia de IA), proveedores de correo y notificaciones push.</li>
      <li><strong>Contenido público:</strong> publicaciones, oraciones, comentarios, nombre de perfil y avatar son visibles para otros usuarios.</li>
      <li><strong>Cumplimiento legal:</strong> cuando lo exija la ley, citación, orden judicial o para proteger derechos, propiedad o seguridad.</li>
      <li><strong>Transferencias comerciales:</strong> en relación con fusiones, adquisiciones o ventas.</li>
    </ul>
    <p><strong>No vendemos tu información personal.</strong></p>

    <h3>5. Retención de datos</h3>
    <p>
      Conservamos los datos mientras tu cuenta esté activa. Cuando solicitas la eliminación, tu
      cuenta se programa para eliminación permanente después de un periodo de gracia de 30 días,
      durante el cual las suscripciones activas se cancelan al final del periodo actual. Las copias
      de seguridad se purgan en 90 días adicionales.
    </p>

    <h3>6. Tus derechos</h3>
    <p>Según tu jurisdicción, puedes tener derecho a acceder, corregir, portar o eliminar tus datos;
    oponerte a cierto procesamiento; retirar el consentimiento; y presentar reclamación ante una
    autoridad supervisora. Los residentes de California (CCPA/CPRA) y de la UE/UK (GDPR) tienen
    derechos adicionales. Para ejercer cualquier derecho, escribe a{" "}
    <a href="mailto:support@hagionai.com">support@hagionai.com</a>.</p>

    <h3>7. Seguridad</h3>
    <p>Usamos protecciones estándar de la industria incluyendo cifrado TLS, cifrado en reposo,
    Row-Level Security, contraseñas con hash y acceso de mínimo privilegio. Ningún sistema es
    perfectamente seguro; usas el Servicio bajo tu propio riesgo.</p>

    <h3>8. Transferencias internacionales</h3>
    <p>Hagion AI opera desde Estados Unidos. Tu información puede procesarse en EE. UU. y otros
    países con leyes de protección de datos diferentes a las de tu país.</p>

    <h3>9. Niños</h3>
    <p>El Servicio no está dirigido a menores de 13 años (16 en la UE/UK). No recopilamos
    conscientemente información de menores. Si crees que lo hemos hecho, contáctanos y la
    eliminaremos.</p>

    <h3>10. Enlaces de terceros</h3>
    <p>El Servicio puede enlazar a sitios de terceros, cuyas prácticas de privacidad se rigen por
    sus propias políticas.</p>

    <h3>11. Cambios a esta política</h3>
    <p>Podemos actualizar esta Política. Los cambios materiales se comunicarán a través del Servicio
    o por correo. El uso continuado constituye aceptación.</p>

    <h3>12. Contacto</h3>
    <p>Hagion AI · Texas, Estados Unidos ·{" "}
    <a href="mailto:support@hagionai.com">support@hagionai.com</a></p>
  </>
);

export default PrivacyPolicy;
