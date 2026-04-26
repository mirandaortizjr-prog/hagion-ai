import { LegalPage } from "@/components/LegalPage";
import { useLanguage } from "@/contexts/LanguageContext";

const TermsOfService = () => {
  const { language } = useLanguage();
  const isEs = language === "es";

  return (
    <LegalPage
      title={isEs ? "Términos de Servicio" : "Terms of Service"}
      lastUpdated={isEs ? "26 de abril, 2026" : "April 26, 2026"}
    >
      {isEs ? <Es /> : <En />}
    </LegalPage>
  );
};

const En = () => (
  <>
    <p>
      These Terms of Service ("Terms") form a binding agreement between you and{" "}
      <strong>Hagion AI</strong> ("Hagion AI," "we," "us," or "our") and govern your access to and
      use of our applications, websites, and related services (the "Service"). By creating an
      account, downloading the app, or using the Service, you agree to these Terms. If you do not
      agree, do not use the Service.
    </p>

    <h3>1. Eligibility</h3>
    <p>
      You must be at least 13 years old (16 in the EU/UK) to use the Service, and at least 18
      years old to enter into paid subscriptions. By using the Service, you represent that you meet
      these requirements and have the legal capacity to accept these Terms.
    </p>

    <h3>2. Account Registration</h3>
    <p>
      You are responsible for maintaining the confidentiality of your credentials and for all
      activity under your account. Notify us immediately at{" "}
      <a href="mailto:support@hagionai.com">support@hagionai.com</a> of any unauthorized access. We
      may suspend or terminate accounts that violate these Terms.
    </p>

    <h3>3. Subscriptions, Trials, & Billing</h3>
    <ul>
      <li><strong>Plans:</strong> Hagion offers Premium, Premium Plus, and Pro tiers, billed monthly. Prices and features are described on the Premium page and may change with notice.</li>
      <li><strong>Free trial:</strong> New subscribers may be eligible for a 3-day free trial. If you do not cancel before the trial ends, you will be charged the regular price.</li>
      <li><strong>Auto-renewal:</strong> Subscriptions renew automatically each billing period unless cancelled before renewal. Cancellations take effect at the end of the current period.</li>
      <li><strong>Payment processors:</strong> Web subscriptions are processed by Stripe; mobile in-app purchases are processed by Google Play Billing or Apple App Store. Their terms apply in addition to ours.</li>
      <li><strong>Refunds:</strong> See our <a href="/refund-policy">Refund & Cancellation Policy</a>.</li>
    </ul>

    <h3>4. AI Content Disclaimer</h3>
    <p>
      The Service uses artificial intelligence to generate responses, devotionals, sermon
      assistance, theological commentary, and other content. <strong>AI output may be inaccurate,
      incomplete, biased, or theologically incorrect.</strong> Outputs are <strong>not</strong> a
      substitute for Scripture itself, pastoral counseling, professional theological education,
      legal advice, medical advice, mental-health treatment, or financial advice. You are solely
      responsible for evaluating the truthfulness, biblical accuracy, and appropriateness of any
      output before relying on it. See our{" "}
      <a href="/ai-disclaimer">AI & Content Disclaimer</a> for details.
    </p>

    <h3>5. Acceptable Use</h3>
    <p>You agree NOT to:</p>
    <ul>
      <li>Use the Service for any unlawful, harmful, harassing, defamatory, sexually explicit, hateful, violent, or fraudulent purpose;</li>
      <li>Impersonate any person or misrepresent your identity or affiliation;</li>
      <li>Upload malware, viruses, or any code intended to disrupt the Service;</li>
      <li>Reverse engineer, decompile, scrape, or attempt to extract source code or training data;</li>
      <li>Use the Service to develop a competing product or to train a competing AI model;</li>
      <li>Bypass usage limits, paywalls, or feature gates;</li>
      <li>Submit other people's personal data without their consent;</li>
      <li>Engage in spam, mass automated requests, or denial-of-service activity;</li>
      <li>Use the Service in a manner that violates the rights of any third party.</li>
    </ul>
    <p>We may remove content, suspend, or terminate accounts at our sole discretion for any violation.</p>

    <h3>6. User Content</h3>
    <p>
      You retain ownership of content you submit ("User Content"). By submitting User Content, you
      grant Hagion AI a worldwide, non-exclusive, royalty-free, sublicensable license to host,
      store, reproduce, modify (for formatting), publish, publicly display, and distribute that
      content as necessary to operate and improve the Service. You represent that you have all
      rights necessary to grant this license and that your content does not infringe any third
      party's rights.
    </p>

    <h3>7. Intellectual Property</h3>
    <p>
      The Service, including all software, designs, branding, logos, written content, devotionals,
      curated stories, and AI prompt configurations, is owned by Hagion AI or its licensors and
      protected by copyright, trademark, and other laws. You receive a limited, non-exclusive,
      non-transferable, revocable license to use the Service for personal, non-commercial purposes
      in accordance with these Terms.
    </p>

    <h3>8. Community & Public Posts</h3>
    <p>
      Posts, prayers, comments, and other public content are visible to other users. Do not post
      anything you are not comfortable sharing publicly. We may moderate, hide, or remove content
      that violates these Terms or our community standards.
    </p>

    <h3>9. Third-Party Services</h3>
    <p>
      The Service integrates third-party services including Supabase, Stripe, Google Play, Apple
      App Store, Google Gemini, OpenAI, and others. Their terms and privacy policies apply to your
      interactions with them. We are not responsible for third-party services.
    </p>

    <h3>10. Disclaimers</h3>
    <p>
      THE SERVICE IS PROVIDED <strong>"AS IS" AND "AS AVAILABLE"</strong> WITHOUT WARRANTIES OF
      ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
      PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, OR UNINTERRUPTED OPERATION. WE DO NOT WARRANT
      THAT AI OUTPUTS ARE ACCURATE, BIBLICALLY CORRECT, OR FIT FOR ANY SPIRITUAL, EMOTIONAL,
      LEGAL, MEDICAL, OR PROFESSIONAL PURPOSE.
    </p>

    <h3>11. Limitation of Liability</h3>
    <p>
      TO THE MAXIMUM EXTENT PERMITTED BY LAW, HAGION AI AND ITS OFFICERS, DIRECTORS, EMPLOYEES,
      AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
      PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING LOSS OF PROFITS, DATA, GOODWILL, SPIRITUAL HARM,
      EMOTIONAL DISTRESS, OR ANY DAMAGES ARISING FROM RELIANCE ON AI OUTPUT. OUR TOTAL CUMULATIVE
      LIABILITY ARISING OUT OF OR RELATING TO THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE
      AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY,
      OR (B) USD $50.
    </p>

    <h3>12. Indemnification</h3>
    <p>
      You agree to defend, indemnify, and hold harmless Hagion AI, its affiliates, and their
      officers, directors, employees, and agents from any claims, damages, liabilities, losses,
      and expenses (including reasonable attorneys' fees) arising from: (a) your use of the
      Service; (b) your User Content; (c) your violation of these Terms; or (d) your violation of
      any third-party right.
    </p>

    <h3>13. Termination</h3>
    <p>
      We may suspend or terminate your account at any time, with or without notice, for any
      reason, including violation of these Terms. You may close your account at any time from
      Settings. Termination does not relieve you of obligations accrued before termination.
      Sections that by their nature should survive termination (including IP, disclaimers,
      limitations of liability, indemnification, and dispute resolution) shall survive.
    </p>

    <h3>14. Dispute Resolution &amp; Binding Arbitration</h3>
    <p>
      <strong>Please read this Section carefully — it affects your legal rights.</strong>
    </p>
    <p>
      Any dispute, claim, or controversy arising out of or relating to these Terms or the Service
      shall be resolved by <strong>binding individual arbitration</strong> administered by the
      American Arbitration Association (AAA) under its Consumer Arbitration Rules. Arbitration
      shall take place in <strong>Travis County, Texas</strong>, or, at your election, by remote
      proceeding. Judgment on the award may be entered in any court of competent jurisdiction.
    </p>
    <p>
      <strong>Class-Action Waiver.</strong> You and Hagion AI agree that disputes will be brought
      only in an individual capacity and not as a plaintiff or class member in any class,
      consolidated, or representative proceeding. The arbitrator may not consolidate claims of
      more than one person and may not preside over any form of representative or class
      proceeding.
    </p>
    <p>
      <strong>Opt-out:</strong> You may opt out of arbitration by sending written notice to{" "}
      <a href="mailto:support@hagionai.com">support@hagionai.com</a> within 30 days of first
      accepting these Terms.
    </p>
    <p>
      <strong>Exceptions:</strong> Either party may bring an individual claim in small-claims
      court, or seek injunctive relief in court for intellectual-property infringement.
    </p>

    <h3>15. Governing Law</h3>
    <p>
      These Terms are governed by the laws of the State of <strong>Texas, USA</strong>, without
      regard to conflict-of-laws principles. Subject to the arbitration clause above, exclusive
      venue for any judicial proceeding is in the state and federal courts located in Travis
      County, Texas.
    </p>

    <h3>16. Changes to Terms</h3>
    <p>
      We may modify these Terms at any time. Material changes will be communicated via the Service
      or by email and take effect on the date posted. Continued use after the effective date
      constitutes acceptance.
    </p>

    <h3>17. Miscellaneous</h3>
    <p>
      These Terms constitute the entire agreement between you and Hagion AI regarding the Service.
      If any provision is held unenforceable, the remaining provisions remain in full force. Our
      failure to enforce any right is not a waiver. You may not assign these Terms; we may assign
      them in connection with a merger, acquisition, or sale of assets.
    </p>

    <h3>18. Contact</h3>
    <p>
      Hagion AI · Texas, United States ·{" "}
      <a href="mailto:support@hagionai.com">support@hagionai.com</a>
    </p>
  </>
);

const Es = () => (
  <>
    <p>
      Estos Términos de Servicio ("Términos") forman un acuerdo vinculante entre tú y{" "}
      <strong>Hagion AI</strong> y rigen tu acceso y uso de nuestras aplicaciones, sitios web y
      servicios relacionados (el "Servicio"). Al crear una cuenta, descargar la app o usar el
      Servicio, aceptas estos Términos. Si no estás de acuerdo, no uses el Servicio.
    </p>

    <h3>1. Elegibilidad</h3>
    <p>Debes tener al menos 13 años (16 en la UE/UK) para usar el Servicio y al menos 18 años para
    suscripciones pagas.</p>

    <h3>2. Registro de cuenta</h3>
    <p>Eres responsable de mantener la confidencialidad de tus credenciales y de toda actividad bajo
    tu cuenta. Notifícanos inmediatamente a{" "}
    <a href="mailto:support@hagionai.com">support@hagionai.com</a> sobre cualquier acceso no
    autorizado.</p>

    <h3>3. Suscripciones, pruebas y facturación</h3>
    <ul>
      <li><strong>Planes:</strong> Premium, Premium Plus y Pro, con facturación mensual.</li>
      <li><strong>Prueba gratuita:</strong> Nuevos suscriptores pueden ser elegibles para 3 días gratis. Si no cancelas antes del fin de la prueba, se te cobrará el precio regular.</li>
      <li><strong>Renovación automática:</strong> Las suscripciones se renuevan automáticamente salvo cancelación previa.</li>
      <li><strong>Procesadores de pago:</strong> Stripe en web; Google Play / Apple App Store en móvil.</li>
      <li><strong>Reembolsos:</strong> Consulta nuestra <a href="/refund-policy">Política de Reembolsos y Cancelación</a>.</li>
    </ul>

    <h3>4. Descargo sobre contenido de IA</h3>
    <p>
      El Servicio usa inteligencia artificial para generar respuestas, devocionales, asistencia con
      sermones, comentario teológico y otro contenido. <strong>La salida de IA puede ser inexacta,
      incompleta, sesgada o teológicamente incorrecta.</strong> Las salidas <strong>no</strong>
      sustituyen las Escrituras, consejería pastoral, educación teológica profesional, asesoría
      legal, médica, de salud mental ni financiera. Eres el único responsable de evaluar la
      veracidad, exactitud bíblica e idoneidad de cualquier salida.
    </p>

    <h3>5. Uso aceptable</h3>
    <p>Aceptas NO:</p>
    <ul>
      <li>Usar el Servicio con fines ilegales, dañinos, acosadores, difamatorios, sexualmente explícitos, de odio, violentos o fraudulentos;</li>
      <li>Suplantar a otra persona o tergiversar tu identidad;</li>
      <li>Subir malware, virus o código que interrumpa el Servicio;</li>
      <li>Realizar ingeniería inversa, descompilar, raspar o extraer código fuente o datos de entrenamiento;</li>
      <li>Usar el Servicio para desarrollar un producto competidor o entrenar un modelo de IA competidor;</li>
      <li>Eludir límites de uso, muros de pago o controles de funciones;</li>
      <li>Enviar datos personales de terceros sin su consentimiento;</li>
      <li>Realizar spam, automatización masiva o ataques de denegación de servicio.</li>
    </ul>

    <h3>6. Contenido del usuario</h3>
    <p>Conservas la propiedad del contenido que envías. Al enviarlo, otorgas a Hagion AI una
    licencia mundial, no exclusiva, libre de regalías y sublicenciable para alojarlo, almacenarlo,
    reproducirlo, modificarlo (para formato), publicarlo, mostrarlo y distribuirlo según sea
    necesario para operar y mejorar el Servicio.</p>

    <h3>7. Propiedad intelectual</h3>
    <p>El Servicio, incluido todo el software, diseños, marcas, logos, contenido escrito,
    devocionales y configuraciones de prompts de IA, es propiedad de Hagion AI o sus licenciantes.
    Recibes una licencia limitada, no exclusiva, no transferible y revocable para uso personal y no
    comercial.</p>

    <h3>8. Comunidad y publicaciones públicas</h3>
    <p>Las publicaciones, oraciones, comentarios y otro contenido público son visibles para otros
    usuarios. No publiques nada que no quieras compartir públicamente. Podemos moderar, ocultar o
    eliminar contenido que viole estos Términos.</p>

    <h3>9. Servicios de terceros</h3>
    <p>El Servicio integra servicios de terceros incluyendo Supabase, Stripe, Google Play, Apple
    App Store, Google Gemini y OpenAI. Sus términos y políticas de privacidad se aplican a tus
    interacciones con ellos.</p>

    <h3>10. Descargos de garantía</h3>
    <p>EL SERVICIO SE PROPORCIONA <strong>"TAL CUAL" Y "SEGÚN DISPONIBILIDAD"</strong> SIN GARANTÍAS
    DE NINGÚN TIPO, EXPRESAS O IMPLÍCITAS. NO GARANTIZAMOS QUE LAS SALIDAS DE IA SEAN EXACTAS,
    BÍBLICAMENTE CORRECTAS NI ADECUADAS PARA NINGÚN PROPÓSITO ESPIRITUAL, EMOCIONAL, LEGAL O
    MÉDICO.</p>

    <h3>11. Limitación de responsabilidad</h3>
    <p>EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY, HAGION AI NO SERÁ RESPONSABLE POR DAÑOS INDIRECTOS,
    INCIDENTALES, ESPECIALES, CONSECUENTES O PUNITIVOS, INCLUIDA LA PÉRDIDA DE GANANCIAS, DATOS,
    BUENA VOLUNTAD, DAÑO ESPIRITUAL, ANGUSTIA EMOCIONAL O CUALQUIER DAÑO QUE SURJA DE LA
    DEPENDENCIA DE LA SALIDA DE IA. NUESTRA RESPONSABILIDAD ACUMULADA TOTAL NO EXCEDERÁ EL MAYOR DE
    (A) LA CANTIDAD QUE PAGASTE EN LOS 12 MESES ANTERIORES O (B) USD $50.</p>

    <h3>12. Indemnización</h3>
    <p>Aceptas defender, indemnizar y eximir de responsabilidad a Hagion AI por cualquier reclamo
    derivado de tu uso del Servicio, tu Contenido de Usuario, tu violación de estos Términos o tu
    violación de derechos de terceros.</p>

    <h3>13. Terminación</h3>
    <p>Podemos suspender o terminar tu cuenta en cualquier momento por violación de estos Términos.
    Puedes cerrar tu cuenta desde Configuración. Las cláusulas que por su naturaleza deban
    sobrevivir a la terminación lo harán.</p>

    <h3>14. Resolución de disputas y arbitraje vinculante</h3>
    <p><strong>Lee esta sección con atención — afecta tus derechos legales.</strong></p>
    <p>Cualquier disputa se resolverá mediante <strong>arbitraje individual vinculante</strong>
    administrado por la American Arbitration Association (AAA) bajo sus Reglas de Arbitraje del
    Consumidor, en <strong>Condado de Travis, Texas</strong>, o por procedimiento remoto a tu
    elección.</p>
    <p><strong>Renuncia a acciones colectivas.</strong> Las disputas se presentarán solo a título
    individual y no como parte de procedimientos de clase, consolidados o representativos.</p>
    <p><strong>Exclusión voluntaria:</strong> Puedes optar por no someterte al arbitraje enviando
    aviso por escrito a <a href="mailto:support@hagionai.com">support@hagionai.com</a> dentro de
    los 30 días posteriores a la primera aceptación de estos Términos.</p>

    <h3>15. Ley aplicable</h3>
    <p>Estos Términos se rigen por las leyes del Estado de <strong>Texas, EE. UU.</strong>, sin
    consideración a conflictos de leyes. Sujeto a la cláusula de arbitraje, la jurisdicción
    exclusiva es en los tribunales estatales y federales del Condado de Travis, Texas.</p>

    <h3>16. Cambios a los Términos</h3>
    <p>Podemos modificar estos Términos en cualquier momento. Los cambios materiales se comunicarán
    a través del Servicio o por correo. El uso continuado constituye aceptación.</p>

    <h3>17. Misceláneas</h3>
    <p>Estos Términos constituyen el acuerdo completo. Si alguna disposición es inaplicable, las
    restantes permanecen vigentes. Nuestra falta de exigir un derecho no constituye renuncia. No
    puedes ceder estos Términos.</p>

    <h3>18. Contacto</h3>
    <p>Hagion AI · Texas, Estados Unidos ·{" "}
    <a href="mailto:support@hagionai.com">support@hagionai.com</a></p>
  </>
);

export default TermsOfService;
