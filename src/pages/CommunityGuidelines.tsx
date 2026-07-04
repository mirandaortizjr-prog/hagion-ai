import { LegalPage } from "@/components/LegalPage";
import { useLanguage } from "@/contexts/LanguageContext";

const CommunityGuidelines = () => {
  const { language } = useLanguage();
  const es = language === "es";

  return (
    <LegalPage
      title={es ? "Normas de la Comunidad" : "Community Guidelines"}
      lastUpdated={es ? "4 de julio de 2026" : "July 4, 2026"}
    >
      {es ? (
        <>
          <p>
            Hagion es una comunidad cristiana dedicada a edificar unos a otros en Cristo. Estas normas
            protegen la integridad bíblica, la seguridad de los usuarios y el espíritu de "hierro con
            hierro se aguza" (Proverbios 27:17).
          </p>

          <h3>1. Fidelidad bíblica</h3>
          <p>
            Todo devocional enviado debe alinearse con la doctrina cristiana ortodoxa histórica:
            Trinidad, deidad de Cristo, salvación por gracia mediante la fe, autoridad de las
            Escrituras. Está prohibido enseñar herejía, evangelio de la prosperidad, universalismo,
            sincretismo o salvación por obras.
          </p>

          <h3>2. Uso correcto de la Escritura</h3>
          <ul>
            <li>Cita la Escritura con precisión y en contexto.</li>
            <li>Interpreta pasajes según el género literario y el contexto histórico.</li>
            <li>No fabriques citas, referencias ni traducciones.</li>
          </ul>

          <h3>3. Contenido prohibido</h3>
          <ul>
            <li>Ataques personales, insultos, acoso o discurso de odio.</li>
            <li>Contenido sexualmente explícito, violento o gráfico.</li>
            <li>Autopromoción, spam, publicidad o solicitud de dinero.</li>
            <li>Contenido político partidista disfrazado de enseñanza espiritual.</li>
            <li>Ataques a otras denominaciones cristianas — desacuerdo respetuoso sí; desprecio no.</li>
          </ul>

          <h3>4. Moderación con IA</h3>
          <p>
            Cada envío pasa por una revisión de IA en dos etapas (doctrinal + calidad) antes de
            entrar a la biblioteca. Los devocionales pueden ser aprobados, marcados para revisión con
            retroalimentación específica, o rechazados. Los comentarios también son revisados.
          </p>

          <h3>5. Reportes de la comunidad</h3>
          <p>
            Cualquier usuario puede reportar contenido inapropiado o teológicamente erróneo. Cuando
            un devocional recibe múltiples reportes, se oculta automáticamente hasta la revisión del
            equipo. El abuso del sistema de reportes puede resultar en la pérdida de este privilegio.
          </p>

          <h3>6. Límites de envío</h3>
          <p>
            Los envíos están limitados a 3 devocionales por autor cada 24 horas para preservar la
            calidad y evitar saturación.
          </p>

          <h3>7. Consecuencias</h3>
          <ul>
            <li>Contenido eliminado por moderación.</li>
            <li>Suspensión temporal de la capacidad de enviar.</li>
            <li>Suspensión permanente de la cuenta por violaciones graves o repetidas.</li>
          </ul>

          <h3>8. Espíritu de la comunidad</h3>
          <p>
            "Sobrellevad los unos las cargas de los otros" (Gálatas 6:2). Publica con humildad,
            corrige con gracia, discrepa con amor. Estamos aquí para señalar hacia Cristo, no hacia
            nosotros mismos.
          </p>
        </>
      ) : (
        <>
          <p>
            Hagion is a Christian community devoted to building one another up in Christ. These
            guidelines protect biblical integrity, user safety, and the "iron sharpens iron" spirit
            of the community (Proverbs 27:17).
          </p>

          <h3>1. Biblical faithfulness</h3>
          <p>
            Every devotional you submit must align with historic orthodox Christian doctrine: the
            Trinity, the deity of Christ, salvation by grace through faith, the authority of
            Scripture. Prosperity gospel, universalism, syncretism, works-based salvation, and other
            heresies are not permitted.
          </p>

          <h3>2. Handling Scripture rightly</h3>
          <ul>
            <li>Quote Scripture accurately and in context.</li>
            <li>Interpret passages according to their literary genre and historical setting.</li>
            <li>Do not fabricate verses, references, or translations.</li>
          </ul>

          <h3>3. Prohibited content</h3>
          <ul>
            <li>Personal attacks, insults, harassment, or hate speech.</li>
            <li>Sexually explicit, violent, or graphic content.</li>
            <li>Self-promotion, spam, advertising, or solicitations for money.</li>
            <li>Partisan political content disguised as spiritual teaching.</li>
            <li>Attacks on other Christian denominations — respectful disagreement is welcome; contempt is not.</li>
          </ul>

          <h3>4. AI moderation</h3>
          <p>
            Every submission passes a two-stage AI review (doctrinal + quality) before it enters the
            library. Devotionals may be approved, flagged for revision with specific feedback, or
            rejected. Comments are also reviewed.
          </p>

          <h3>5. Community reports</h3>
          <p>
            Any user can report inappropriate or theologically unsound content. When a devotional
            receives multiple reports, it is automatically hidden pending team review. Abuse of the
            reporting system may cost you the privilege.
          </p>

          <h3>6. Submission limits</h3>
          <p>
            Submissions are capped at 3 devotionals per author every 24 hours to preserve quality
            and prevent flooding.
          </p>

          <h3>7. Consequences</h3>
          <ul>
            <li>Removal of the content by moderation.</li>
            <li>Temporary suspension of your ability to submit.</li>
            <li>Permanent account suspension for serious or repeated violations.</li>
          </ul>

          <h3>8. Spirit of the community</h3>
          <p>
            "Bear one another's burdens" (Galatians 6:2). Post in humility, correct with grace,
            disagree in love. We are here to point to Christ — not to ourselves.
          </p>
        </>
      )}
    </LegalPage>
  );
};

export default CommunityGuidelines;
