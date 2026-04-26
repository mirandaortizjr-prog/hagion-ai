import { LegalPage } from "@/components/LegalPage";
import { useLanguage } from "@/contexts/LanguageContext";

const AIDisclaimer = () => {
  const { language } = useLanguage();
  const isEs = language === "es";

  return (
    <LegalPage
      title={isEs ? "Descargo de IA y Contenido" : "AI & Content Disclaimer"}
      lastUpdated={isEs ? "26 de abril, 2026" : "April 26, 2026"}
    >
      {isEs ? <Es /> : <En />}
    </LegalPage>
  );
};

const En = () => (
  <>
    <p>
      <strong>Hagion AI</strong> uses artificial intelligence — large language models from
      providers including Google Gemini and OpenAI — to generate spiritual, theological, and
      educational content. This Disclaimer explains the limits of that content and your
      responsibilities as a user.
    </p>

    <h3>1. AI Output Is Generated, Not Inspired</h3>
    <p>
      All AI-generated text, audio, and recommendations within the Service are produced by
      statistical language models. <strong>AI output is not divinely inspired, infallible, or
      authoritative.</strong> It can be incorrect, contradictory, biased, theologically unsound,
      or simply made up ("hallucinated"). It must always be tested against Scripture and sound
      teaching.
    </p>

    <h3>2. Not a Substitute for Scripture or Pastoral Care</h3>
    <p>
      Hagion AI is a study aid and discussion partner. It is <strong>not</strong> a replacement
      for:
    </p>
    <ul>
      <li>The Bible itself or sound biblical exegesis;</li>
      <li>A qualified pastor, elder, spiritual director, or counselor;</li>
      <li>A licensed therapist or mental-health professional;</li>
      <li>A licensed physician, attorney, accountant, or other professional;</li>
      <li>Personal prayer, study, fellowship, and the local church.</li>
    </ul>

    <h3>3. Discernment Tools Are Aids, Not Verdicts</h3>
    <p>
      The Service includes tools that analyze sermons, music, religious texts, churches, prophecy
      claims, and belief systems. These tools express informed opinions generated from the model's
      training data and the prompts we engineer. <strong>They are not authoritative judgments of
      any person, ministry, or organization.</strong> Use them as starting points for your own
      study, never as final pronouncements.
    </p>

    <h3>4. Crisis &amp; Emergency Situations</h3>
    <p>
      Hagion AI is not designed for crisis intervention. <strong>If you are in danger, having
      thoughts of self-harm, or facing a medical or mental-health emergency, contact local
      emergency services immediately</strong> (911 in the US) or a crisis hotline (988 in the US,
      or local equivalent).
    </p>

    <h3>5. Sensitive Information</h3>
    <p>
      Do not submit confidential, regulated, sensitive personal, medical, or third-party
      information to AI features. Once submitted, content may be transmitted to third-party AI
      providers and stored in our database to power the feature.
    </p>

    <h3>6. User Responsibility</h3>
    <p>
      You are solely responsible for how you interpret, share, and act upon AI output. Hagion AI,
      its operators, contributors, and providers are not liable for decisions, beliefs, or actions
      taken based on AI-generated content. See sections 10–11 of our{" "}
      <a href="/terms">Terms of Service</a> for the full disclaimers and limitation of liability.
    </p>

    <h3>7. Reporting Inaccurate or Harmful Output</h3>
    <p>
      If you encounter clearly inaccurate, harmful, or theologically dangerous output, please
      report it to <a href="mailto:support@hagionai.com">support@hagionai.com</a> with the prompt
      and the response so we can improve the Service.
    </p>

    <h3>8. Contact</h3>
    <p>
      Hagion AI · Texas, United States ·{" "}
      <a href="mailto:support@hagionai.com">support@hagionai.com</a>
    </p>
  </>
);

const Es = () => (
  <>
    <p>
      <strong>Hagion AI</strong> usa inteligencia artificial — modelos de lenguaje grandes de
      proveedores como Google Gemini y OpenAI — para generar contenido espiritual, teológico y
      educativo. Este Descargo explica los límites de ese contenido y tus responsabilidades como
      usuario.
    </p>

    <h3>1. La salida de IA es generada, no inspirada</h3>
    <p>Todo texto, audio y recomendación generado por IA en el Servicio es producido por modelos
    estadísticos. <strong>La salida de IA no es divinamente inspirada, infalible ni
    autoritativa.</strong> Puede ser incorrecta, contradictoria, sesgada, teológicamente errónea o
    simplemente inventada ("alucinada"). Siempre debe probarse contra las Escrituras y la sana
    doctrina.</p>

    <h3>2. No sustituye a las Escrituras ni al cuidado pastoral</h3>
    <p>Hagion AI es una ayuda de estudio y compañero de discusión. <strong>No</strong> reemplaza:</p>
    <ul>
      <li>La Biblia misma ni la sana exégesis bíblica;</li>
      <li>Un pastor, anciano, director espiritual o consejero calificado;</li>
      <li>Un terapeuta o profesional de salud mental licenciado;</li>
      <li>Un médico, abogado, contador u otro profesional licenciado;</li>
      <li>La oración personal, el estudio, la comunión y la iglesia local.</li>
    </ul>

    <h3>3. Las herramientas de discernimiento son ayudas, no veredictos</h3>
    <p>El Servicio incluye herramientas que analizan sermones, música, textos religiosos, iglesias,
    afirmaciones proféticas y sistemas de creencias. Estas herramientas expresan opiniones
    informadas generadas por los datos de entrenamiento del modelo. <strong>No son juicios
    autoritativos sobre ninguna persona, ministerio u organización.</strong> Úsalas como punto de
    partida para tu propio estudio, nunca como pronunciamientos finales.</p>

    <h3>4. Situaciones de crisis y emergencia</h3>
    <p>Hagion AI no está diseñado para intervención en crisis. <strong>Si estás en peligro, tienes
    pensamientos de autolesión o enfrentas una emergencia médica o de salud mental, contacta
    inmediatamente a los servicios de emergencia locales</strong> o a una línea de crisis.</p>

    <h3>5. Información sensible</h3>
    <p>No envíes información confidencial, regulada, personal sensible, médica o de terceros a las
    funciones de IA. Una vez enviado, el contenido puede transmitirse a proveedores de IA externos
    y almacenarse en nuestra base de datos.</p>

    <h3>6. Responsabilidad del usuario</h3>
    <p>Eres el único responsable de cómo interpretas, compartes y actúas sobre la salida de IA.
    Hagion AI, sus operadores, colaboradores y proveedores no son responsables por decisiones,
    creencias o acciones tomadas basadas en contenido generado por IA. Consulta las secciones 10–11
    de nuestros <a href="/terms">Términos de Servicio</a>.</p>

    <h3>7. Reportar salida inexacta o dañina</h3>
    <p>Si encuentras salida claramente inexacta, dañina o teológicamente peligrosa, repórtala a{" "}
    <a href="mailto:support@hagionai.com">support@hagionai.com</a> con el prompt y la respuesta
    para que podamos mejorar el Servicio.</p>

    <h3>8. Contacto</h3>
    <p>Hagion AI · Texas, Estados Unidos ·{" "}
    <a href="mailto:support@hagionai.com">support@hagionai.com</a></p>
  </>
);

export default AIDisclaimer;
