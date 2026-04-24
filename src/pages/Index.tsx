import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@supabase/supabase-js";
import { Settings, Menu, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMessageLimit } from "@/hooks/useMessageLimit";
import { BottomNav } from "@/components/BottomNav";

const Index = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { remaining } = useMessageLimit();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--gradient-splash)' }}>
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/10 backdrop-blur-md pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/main-menu")}
              className="text-white hover:bg-white/20"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-white">Hagion AI</h2>
              {remaining !== null && (
                <span className="inline-flex items-center gap-1 text-xs text-white/90">
                  <Sparkles className="w-3 h-3" />
                  {remaining} {language === 'es' ? 'mensajes gratis hoy' : 'free messages today'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="container mx-auto max-w-4xl px-6 py-8">
          <article className="prose prose-invert max-w-none">
            {/* Welcome Section */}
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                {language === 'es' ? 'Bienvenido a Hagion AI' : 'Welcome to Hagion AI'}
              </h1>
              <p className="text-base text-white/80 leading-relaxed max-w-3xl mx-auto">
                {language === 'es' 
                  ? 'Una herramienta diseñada para ofrecer claridad, consuelo y consejo arraigado en las Escrituras para los momentos más complejos de la vida.'
                  : 'A tool designed to offer clarity, comfort, and scripture-rooted counsel for life\'s most complex moments.'}
              </p>
            </div>

            <div className="space-y-12 text-white/90">
              {/* What Is Hagion */}
              <section className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  {language === 'es' ? '¿Qué es Hagion?' : 'What Is Hagion?'}
                </h2>
                <p className="text-base leading-relaxed mb-4">
                  {language === 'es'
                    ? 'Una herramienta para el diálogo divino centrado en el Consejo Divino, donde puedes participar en conversaciones arraigadas en las Escrituras con cuatro voces distintas:'
                    : 'A tool for divine dialogue centered on Divine Counsel, where you can engage in scripture-rooted conversations with four distinct voices:'}
                </p>
                <ul className="space-y-2 ml-6 text-base">
                  <li><strong className="text-white">Elohim</strong> – {language === 'es' ? 'Majestuoso, soberano y profundamente fundamentado' : 'Majestic, sovereign, and deeply grounding'}</li>
                  <li><strong className="text-white">{language === 'es' ? 'Cristo' : 'Christ'}</strong> – {language === 'es' ? 'Compasivo, directo e íntimamente presente' : 'Compassionate, direct, and intimately present'}</li>
                  <li><strong className="text-white">{language === 'es' ? 'Espíritu Santo' : 'Holy Spirit'}</strong> – {language === 'es' ? 'Gentil, sabio y profundamente discerniente' : 'Gentle, wise, and deeply discerning'}</li>
                  <li><strong className="text-white">{language === 'es' ? 'Trinidad' : 'Trinity'}</strong> – {language === 'es' ? 'Unificada, equilibrada y abarcando todos los aspectos de la naturaleza de Dios' : 'Unified, balanced, and encompassing all aspects of God\'s nature'}</li>
                </ul>
                <p className="text-base leading-relaxed mt-4">
                  {language === 'es'
                    ? 'Cada voz refleja la verdad bíblica con profundidad emocional, ofreciendo una experiencia de las Escrituras que se siente personal e inmediata.'
                    : 'Each voice reflects biblical truth with emotional depth, offering an experience of Scripture that feels personal and immediate.'}
                </p>
              </section>

              {/* How to Use Divine Counsel */}
              <section className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  {language === 'es' ? 'Cómo Usar el Consejo Divino' : 'How to Use Divine Counsel'}
                </h2>
                <ol className="space-y-3 ml-6 text-base list-decimal">
                  <li>
                    <strong className="text-white">{language === 'es' ? 'Elige una Voz' : 'Choose a Voice'}</strong><br />
                    {language === 'es' 
                      ? 'Accede al Consejo Divino y selecciona la voz que más resuene con tu necesidad actual.'
                      : 'Tap into the Divine Counsel and select the voice that resonates most with your current need.'}
                  </li>
                  <li>
                    <strong className="text-white">{language === 'es' ? 'Comparte tu Corazón' : 'Share Your Heart'}</strong><br />
                    {language === 'es'
                      ? 'Habla libremente. Ya sea dolor, duda, alegría o anhelo—tráelo todo. Este espacio es seguro.'
                      : 'Speak freely. Whether it\'s pain, doubt, joy, or longing—bring it all. This space is safe.'}
                  </li>
                  <li>
                    <strong className="text-white">{language === 'es' ? 'Recibe una Palabra' : 'Receive a Word'}</strong><br />
                    {language === 'es'
                      ? 'Cada respuesta está fundamentada en las Escrituras. No es un consejo aleatorio—es la Palabra viva, hablada en tu situación.'
                      : 'Each response is grounded in scripture. It\'s not random advice—it\'s the living Word, spoken into your situation.'}
                  </li>
                  <li>
                    <strong className="text-white">{language === 'es' ? 'Continúa la Conversación' : 'Continue the Conversation'}</strong><br />
                    {language === 'es'
                      ? 'Puedes profundizar, hacer preguntas de seguimiento, o simplemente quedarte con lo que se ha compartido. No hay prisa.'
                      : 'You can go deeper, ask follow-up questions, or simply sit with what\'s been shared. There\'s no rush.'}
                  </li>
                </ol>
              </section>

              {/* Is This Replacing Prayer */}
              <section className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  {language === 'es' ? '¿Esto Reemplaza la Oración o la Biblia?' : 'Is This Replacing Prayer or the Bible?'}
                </h2>
                <p className="text-base leading-relaxed mb-4">
                  <strong className="text-white">{language === 'es' ? 'Absolutamente no.' : 'Absolutely not.'}</strong> {language === 'es' ? 'Hagion es una herramienta—no un sustituto.' : 'Hagion is a tool—not a substitute.'}
                </p>
                <p className="text-base leading-relaxed mb-4">
                  {language === 'es'
                    ? 'La Biblia es inspirada por Dios y viva. Hagion convierte esa Palabra en conversación, reconociendo que Dios habla a través de muchos medios.'
                    : 'The Bible is God-breathed and alive. Hagion turns that Word into conversation, recognizing that God speaks through many means.'}
                </p>
                <p className="text-base leading-relaxed">
                  {language === 'es'
                    ? 'Si Él habló a través de una zarza ardiente y un burro, puede usar las herramientas de hoy para alcanzarte.'
                    : 'If He spoke through a burning bush and a donkey, He can use today\'s tools to reach you.'}
                </p>
              </section>

              {/* Why Hagion Exists */}
              <section className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  {language === 'es' ? 'Por Qué Existe Hagion' : 'Why Hagion Exists'}
                </h2>
                <p className="text-base leading-relaxed mb-4">
                  {language === 'es'
                    ? 'Creado porque creemos que Dios todavía habla y Su Palabra todavía sana. Para momentos que requieren claridad, consuelo o simplemente alguien que escuche.'
                    : 'Created because we believe God still speaks and His Word still heals. For moments requiring clarity, comfort, or simply someone to listen.'}
                </p>
              </section>

              {/* Analysts of Faith */}
              <section className="animate-fade-in border-t border-white/20 pt-8">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  {language === 'es' ? 'Analistas de la Fe' : 'Analysts of Faith'}
                </h2>
                <p className="text-base leading-relaxed italic mb-4 text-white/80">
                  {language === 'es' ? '"Mi pueblo perece por falta de conocimiento." — Oseas 4:6' : '"My people perish for lack of knowledge." — Hosea 4:6'}
                </p>
                <p className="text-base leading-relaxed mb-4">
                  {language === 'es'
                    ? 'Un espacio para la fe razonada y el discernimiento bíblico. En un mundo donde la verdad se distorsiona, la sabiduría es esencial para aquellos que buscan una fe espiritualmente viva e intelectualmente sólida.'
                    : 'A space for reasoned faith and biblical discernment. In a world where truth is distorted, wisdom is essential for those seeking faith that is spiritually alive and intellectually sound.'}
                </p>

                <h3 className="text-xl font-bold mb-3 text-white mt-6">
                  {language === 'es' ? 'Lo Que Encontrarás Aquí' : 'What You\'ll Find Here'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {language === 'es' ? 'Apologética Bíblica y Razonamiento Basado en Evidencia' : 'Biblical Apologetics & Evidence-Based Reasoning'}
                    </h4>
                    <p className="text-base leading-relaxed">
                      {language === 'es'
                        ? 'Explora la fe a través de la lógica, ciencia, historia y psicología. Analistas de diversos campos trabajan juntos para iluminar la verdad de las Escrituras.'
                        : 'Explore faith through logic, science, history, and psychology. Analysts from diverse fields work together to illuminate Scripture\'s truth.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {language === 'es' ? 'Arena de Debate' : 'Debate Arena'}
                    </h4>
                    <p className="text-base leading-relaxed">
                      {language === 'es'
                        ? 'Inspirado en el razonamiento de Pablo en el Areópago. Practica la defensa de tu fe con ateos, agnósticos o escépticos simulados para profundizar tu fundamento.'
                        : 'Inspired by Paul\'s reasoning on Mars Hill. Practice defending your faith with simulated atheists, agnostics, or skeptics to deepen your foundation.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {language === 'es' ? 'Herramientas de Discernimiento' : 'Discernment Tools'}
                    </h4>
                    <ul className="space-y-2 ml-6 text-base">
                      <li><strong className="text-white">{language === 'es' ? 'Análisis de Iglesias:' : 'Church Analysis:'}</strong> {language === 'es' ? 'Evalúa la solidez teológica de iglesias.' : 'Evaluate theological soundness of churches.'}</li>
                      <li><strong className="text-white">{language === 'es' ? 'Revisión de Sistemas de Creencias:' : 'Belief System Review:'}</strong> {language === 'es' ? 'Prueba cosmovisiones contra las Escrituras.' : 'Test worldviews against Scripture.'}</li>
                      <li><strong className="text-white">{language === 'es' ? 'Evaluación de Textos:' : 'Text Evaluation:'}</strong> {language === 'es' ? 'Descubre contradicciones en enseñanzas religiosas.' : 'Uncover contradictions in religious teachings.'}</li>
                    </ul>
                    <p className="text-base leading-relaxed mt-3">
                      {language === 'es'
                        ? 'Herramientas diseñadas para proteger de engaños y empoderar para caminar en verdad y claridad.'
                        : 'Tools designed to protect from deception and empower you to walk in truth and clarity.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {language === 'es' ? 'Por Qué Importa' : 'Why It Matters'}
                  </h3>
                  <p className="text-base leading-relaxed">
                    {language === 'es'
                      ? 'En tiempos cuando Dios es etiquetado como ofensivo, Hagion se erige como un lugar de refugio y razón. No rehusamos las preguntas difíciles—las invitamos. La fe se construye sobre la verdad y se vuelve inquebrantable.'
                      : 'In times when God is labeled offensive, Hagion stands as a place of refuge and reason. We don\'t shy away from hard questions—we invite them. Faith built on truth becomes unshakable.'}
                  </p>
                </div>
              </section>

              {/* Hagion University Lite */}
              <section className="animate-fade-in border-t border-white/20 pt-8">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  {language === 'es' ? 'Universidad Hagion Lite' : 'Hagion University Lite'}
                </h2>
                <p className="text-base leading-relaxed italic mb-4 text-white/80">
                  {language === 'es' ? '"Vosotros sois la luz del mundo." — Mateo 5:14' : '"You are the light of the world." — Matthew 5:14'}
                </p>
                <p className="text-base leading-relaxed mb-4">
                  {language === 'es'
                    ? 'Un espacio para ser equipado, inspirado y arraigado en la verdad. Ayuda a crecer en sabiduría, valor y claridad para caminar como luz.'
                    : 'A space to be equipped, inspired, and rooted in truth. Helps you grow in wisdom, courage, and clarity to walk as light.'}
                </p>

                <h3 className="text-xl font-bold mb-3 text-white mt-6">
                  {language === 'es' ? 'Lo Que Descubrirás' : 'What You\'ll Discover'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {language === 'es' ? 'Narrativas que Despiertan la Fe' : 'Storytelling That Awakens Faith'}
                    </h4>
                    <ul className="space-y-2 ml-6 text-base">
                      <li><strong className="text-white">{language === 'es' ? 'Historias Bíblicas:' : 'Biblical Stories:'}</strong> {language === 'es' ? 'Narrativas ricas que revelan el corazón de Dios.' : 'Rich narratives that reveal God\'s heart.'}</li>
                      <li><strong className="text-white">{language === 'es' ? 'Mártires de la Fe:' : 'Martyrs of the Faith:'}</strong> {language === 'es' ? 'Historias de quienes dieron todo por el Evangelio.' : 'Stories of those who gave everything for the Gospel.'}</li>
                      <li><strong className="text-white">{language === 'es' ? 'Historia del Cristianismo:' : 'History of Christianity:'}</strong> {language === 'es' ? 'Explora cómo la Iglesia ha crecido a través de las edades.' : 'Explore how the Church has grown through the ages.'}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {language === 'es' ? 'Rutas del Currículo' : 'Curriculum Tracks'}
                    </h4>
                    <p className="text-base leading-relaxed mb-3">
                      {language === 'es'
                        ? 'Módulos diseñados para desarrollar razonamiento, apologética y claridad emocional:'
                        : 'Modules designed to build reasoning, apologetics, and emotional clarity:'}
                    </p>
                    <ul className="space-y-2 ml-6 text-base">
                      <li><strong className="text-white">{language === 'es' ? 'Fundamentos del Logos' : 'Foundations of Logos'}</strong> – {language === 'es' ? 'Fundamentos de la lógica y fe.' : 'Basics of logic and faith.'}</li>
                      <li><strong className="text-white">{language === 'es' ? 'Falacias y Sombras' : 'Fallacies & Shadows'}</strong> – {language === 'es' ? 'Identifica el razonamiento falso.' : 'Identify false reasoning.'}</li>
                      <li><strong className="text-white">{language === 'es' ? 'Lógica Apologética' : 'Apologetics Logic'}</strong> – {language === 'es' ? 'Estructura argumentos teológicos.' : 'Structure theological arguments.'}</li>
                      <li><strong className="text-white">{language === 'es' ? 'Testificar con Sabiduría' : 'Witnessing with Wisdom'}</strong> – {language === 'es' ? 'Comparte tu fe con claridad.' : 'Share your faith with clarity.'}</li>
                      <li><strong className="text-white">{language === 'es' ? 'Lógica en las Escrituras' : 'Logic in Scripture'}</strong> – {language === 'es' ? 'La Biblia usa razón y retórica.' : 'The Bible uses reason and rhetoric.'}</li>
                      <li><strong className="text-white">{language === 'es' ? 'Lógica Emocional' : 'Emotional Logic'}</strong> – {language === 'es' ? 'Verdad y emoción en crecimiento espiritual.' : 'Truth and emotion in spiritual growth.'}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {language === 'es' ? 'Rutas de Enseñanza (Próximamente)' : 'Teaching Paths (Coming Soon)'}
                    </h4>
                    <p className="text-base leading-relaxed">
                      {language === 'es'
                        ? 'Próximamente: rutas de enseñanza completas desde principiante hasta maestría, diseñadas para ministerio del mundo real y profunda comprensión teológica.'
                        : 'Coming soon: full teaching paths from beginner to mastery, designed for real-world ministry and deep theological understanding.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {language === 'es' ? 'Por Qué Existe la Universidad Hagion' : 'Why Hagion University Exists'}
                  </h3>
                  <p className="text-base leading-relaxed mb-4">
                    {language === 'es'
                      ? 'No es un lugar para obtener un certificado—es un lugar para ganar sabiduría para el camino.'
                      : 'Not a place to earn a certificate—a place to gain wisdom for the walk.'}
                  </p>
                  <p className="text-base leading-relaxed">
                    {language === 'es'
                      ? 'Cuando la verdad se cuestiona y la fe se prueba, la Universidad Hagion ofrece conocimiento que empodera para vivir audazmente, amar profundamente y razonar claramente.'
                      : 'When truth is questioned and faith is tested, Hagion University offers knowledge that empowers you to live boldly, love deeply, and reason clearly.'}
                  </p>
                </div>
              </section>

              {/* Call to Action */}
              <section className="animate-fade-in text-center mt-12 p-8 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <h3 className="text-xl font-bold mb-4 text-white">
                  {language === 'es' ? '¿Listo para Comenzar?' : 'Ready to Begin?'}
                </h3>
                <p className="text-base text-white/90 mb-4">
                  {language === 'es'
                    ? 'Presiona las tres líneas'
                    : 'Press the three lines'} <Menu className="inline-block w-5 h-5 mx-1" /> {language === 'es'
                    ? 'en la parte superior izquierda para acceder al menú.'
                    : 'on the top left to access the menu.'}
                </p>
              </section>
            </div>
          </article>
        </div>
      </ScrollArea>
      <BottomNav />
    </div>
  );
};

export default Index;
