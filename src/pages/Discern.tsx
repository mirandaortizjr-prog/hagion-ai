import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Church, Search, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BottomNav } from "@/components/BottomNav";

const Discern = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [churchName, setChurchName] = useState("");


  const text = language === 'es' ? {
    title: 'Discernimiento',
    subtitle: 'Tres Círculos de Discernimiento',
    introPart1: 'El discernimiento espiritual es la capacidad dada por Dios para distinguir la verdad del engaño, la luz de las tinieblas, y la sana doctrina de la falsa enseñanza. Como advirtió el Apóstol Juan,',
    scriptureQuote: '"Amados, no creáis a todo espíritu, sino probad los espíritus si son de Dios" (1 Juan 4:1)',
    introPart2: 'Estos tres círculos representan áreas distintas de evaluación teológica, cada una diseñada para ayudarte a examinar aspectos específicos de la práctica religiosa, doctrina y enseñanza a través de la lente de la verdad bíblica. Selecciona una categoría a continuación para comenzar tu análisis profundo con nuestro asistente de IA especializado en apologética cristiana, teología sistemática e interpretación escritural.',
    churches: { name: 'Iglesias', desc: 'Evalúa iglesias individuales para verificar su alineación con la verdadera fe cristiana.', detailed: 'Evalúa congregaciones, ministerios u organizaciones eclesiásticas específicas contra los estándares bíblicos. Examina su doctrina, enseñanza, prácticas de adoración, estructura de liderazgo y fruto espiritual. Determina si se adhieren a las verdades cristianas esenciales, practican la autoridad bíblica y demuestran una transformación espiritual genuina.', criteria: ['Ortodoxia doctrinal', 'Enseñanza bíblica', 'Fruto espiritual', 'Responsabilidad del liderazgo', 'Prácticas de adoración'] },
    beliefSystems: { name: 'Sistemas de Creencias', desc: 'Evalúa sistemas de creencias, denominaciones o religiones para determinar su solidez teológica.', detailed: 'Analiza marcos teológicos completos, distintivos denominacionales, movimientos religiosos o religiones mundiales. Compara sus creencias fundamentales sobre Dios, la salvación, las Escrituras y la humanidad contra la teología cristiana ortodoxa. Identifica puntos de convergencia y divergencia de la verdad bíblica.', criteria: ['Visión de Dios y la Trinidad', 'Doctrina de la salvación', 'Autoridad bíblica', 'Deidad y obra de Cristo', 'Consistencia teológica'] },
    religiousTexts: { name: 'Textos Religiosos', desc: 'Evalúa textos sagrados o espirituales para verificar su integridad teológica y resonancia.', detailed: 'Examina escritos religiosos, libros espirituales, revelaciones modernas o textos extrabíblicos que reclaman autoridad espiritual. Prueba sus afirmaciones contra las Escrituras, evalúa su coherencia teológica, identifica contradicciones con la revelación bíblica y determina si promueven la verdad o el engaño.', criteria: ['Alineación escritural', 'Coherencia teológica', 'Precisión histórica', 'Reclamos de autoridad espiritual', 'Consistencia interna'] },
    inDepthAnalysis: 'Análisis Profundo',
    evaluationCriteria: 'Criterios de Evaluación',
    beginEvaluation: 'Comenzar Evaluación',
    churchNamePlaceholder: 'Nombre de la iglesia (opcional)',
    churchNameLabel: 'Nombre de la iglesia específica'
  } : {
    title: 'Discern',
    subtitle: 'Three Circles of Discernment',
    introPart1: 'Spiritual discernment is the God-given ability to distinguish truth from deception, light from darkness, and sound doctrine from false teaching. As the Apostle John warned,',
    scriptureQuote: '"Beloved, do not believe every spirit, but test the spirits to see whether they are from God" (1 John 4:1)',
    introPart2: 'These three circles represent distinct areas of theological evaluation, each designed to help you examine specific aspects of religious practice, doctrine, and teaching through the lens of biblical truth. Select a category below to begin your in-depth analysis with our specialized AI assistant trained in Christian apologetics, systematic theology, and scriptural interpretation.',
    churches: { name: 'Churches', desc: 'Evaluate individual churches for alignment with the true Christian faith.', detailed: 'Assess specific congregations, ministries, or church organizations against biblical standards. Examine their doctrine, teaching, worship practices, leadership structure, and spiritual fruit. Determine whether they hold to essential Christian truths, practice biblical authority, and demonstrate genuine spiritual transformation.', criteria: ['Doctrinal orthodoxy', 'Biblical teaching', 'Spiritual fruit', 'Leadership accountability', 'Worship practices'] },
    beliefSystems: { name: 'Belief Systems', desc: 'Evaluate belief systems, denominations, or religions for theological soundness.', detailed: 'Analyze entire theological frameworks, denominational distinctives, religious movements, or world religions. Compare their core beliefs about God, salvation, Scripture, and humanity against orthodox Christian theology. Identify points of convergence and divergence from biblical truth.', criteria: ['View of God & Trinity', 'Doctrine of salvation', 'Biblical authority', 'Christ\'s deity & work', 'Theological consistency'] },
    religiousTexts: { name: 'Religious Texts', desc: 'Evaluate sacred or spiritual texts for theological integrity and resonance.', detailed: 'Examine religious writings, spiritual books, modern revelations, or extrabiblical texts claiming spiritual authority. Test their claims against Scripture, assess their theological coherence, identify contradictions with biblical revelation, and determine whether they promote truth or deception.', criteria: ['Scriptural alignment', 'Theological coherence', 'Historical accuracy', 'Spiritual authority claims', 'Internal consistency'] },
    inDepthAnalysis: 'In-Depth Analysis',
    evaluationCriteria: 'Evaluation Criteria',
    beginEvaluation: 'Begin Evaluation',
    churchNamePlaceholder: 'Church name (optional)',
    churchNameLabel: 'Specific church name'
  };

  const discernOptions = [
    {
      id: "churches",
      ...text.churches,
      icon: Church,
      color: "text-amber-500",
    },
    {
      id: "belief-systems",
      ...text.beliefSystems,
      icon: Search,
      color: "text-[#3BB4F2]",
    },
    {
      id: "texts",
      ...text.religiousTexts,
      icon: BookOpen,
      color: "text-blue-500",
    },
  ];

  const handleCircleClick = (categoryId: string, specificChurch?: string) => {
    const churchParam = specificChurch ? `&church=${encodeURIComponent(specificChurch)}` : '';
    navigate(`/chat?discern=${categoryId}${churchParam}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main-menu")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-secondary">{text.title}</h1>
            <p className="text-muted-foreground">{text.subtitle}</p>
          </div>
        </div>

        {/* Description */}
        <Card className="mb-12 border-primary/20 bg-gradient-to-br from-card to-background">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Search className="w-6 h-6 text-primary" />
              {text.subtitle}
            </CardTitle>
            <CardDescription className="text-base leading-relaxed mt-3">
              {text.introPart1}{' '}
              <em className="text-muted-foreground">{text.scriptureQuote}</em>.
            </CardDescription>
            <CardDescription className="text-base leading-relaxed mt-4">
              {text.introPart2}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Three Circles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
          {discernOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card 
                key={option.id}
                className="group flex flex-col overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl cursor-pointer"
                onClick={(e) => {
                  // Only trigger navigation if not clicking on input
                  if (!(e.target as HTMLElement).closest('input')) {
                    handleCircleClick(option.id, option.id === 'churches' ? churchName : undefined);
                  }
                }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      {/* Outer ring */}
                      <div className="absolute inset-0 rounded-full border-4 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-110" />
                      
                      {/* Main circle */}
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-background to-card border-4 border-primary flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                        <Icon className={`w-12 h-12 ${option.color}`} />
                      </div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl mb-2">{option.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {option.desc}
                  </CardDescription>
                </CardHeader>

                <div className="px-6 pb-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">{text.inDepthAnalysis}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {option.detailed}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">{text.evaluationCriteria}</h4>
                    <ul className="space-y-1">
                      {option.criteria.map((criterion, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {option.id === 'churches' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">{text.churchNameLabel}</label>
                      <Input
                        type="text"
                        placeholder={text.churchNamePlaceholder}
                        value={churchName}
                        onChange={(e) => {
                          e.stopPropagation();
                          setChurchName(e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm"
                      />
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCircleClick(option.id, option.id === 'churches' ? churchName : undefined);
                    }}
                  >
                    {text.beginEvaluation}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Discern;
