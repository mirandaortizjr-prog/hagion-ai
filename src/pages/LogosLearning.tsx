import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCurriculumData } from "@/data/curriculumData";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { useTierAccess } from "@/hooks/useTierAccess";
import { FeatureLockCard } from "@/components/FeatureLockCard";

const LogosLearning = () => {
  const navigate = useNavigate();
  const { type, id } = useParams<{ type: string; id: string }>();
  const { t, language } = useLanguage();
  const access = useTierAccess();
  const curriculumData = getCurriculumData(language);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  if (!access.isLoading && !access.canUse("hagion_university")) {
    return (
      <FeatureLockCard
        requiredTier="premium"
        featureName={language === "es" ? "Universidad Hagion" : "Hagion University"}
        description={
          language === "es"
            ? "Accede al currículo completo de Hagion University con el plan Premium o superior."
            : "Unlock the full Hagion University curriculum with Premium or higher."
        }
        onBack={() => navigate("/main-menu?tab=hagion-university")}
      />
    );
  }

  const trackTitles: Record<string, string> = {
    foundations: t('foundations_logos'),
    fallacies: t('fallacies_shadows'),
    apologetics: t('apologetics_logic'),
    witnessing: t('witnessing_wisdom'),
    scripture: t('logic_scripture'),
    emotional: t('emotional_logic'),
  };

  const pathTitles: Record<string, string> = {
    "apologetics-path": t('apologetics_path'),
    "witnessing-path": t('witnessing_path'),
    "logic-path": t('logic_path'),
    "scriptural-path": t('scriptural_path'),
    "ceremonial-path": t('ceremonial_path'),
  };

  const title = type === "track" ? trackTitles[id || ""] : pathTitles[id || ""];
  const curriculum = id ? curriculumData[id] : null;

  const totalLessons = curriculum?.modules.reduce((acc, mod) => acc + mod.lessons.length, 0) || 0;

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Floating header — matches SubjectDailyStory */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/40 border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main-menu?tab=hagion-university")}
            className="tap-scale rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/60">
              {type === "track" ? t('curriculum_track') : t('teaching_path_label')}
            </p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-auto px-5 sm:px-6 pt-8 pb-32">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <h1 className="text-center text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-white mb-3 px-2">
            {title}
          </h1>

          {/* Theme pill */}
          <div className="flex justify-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-accent/90 px-3 py-1 rounded-full border border-accent/20 bg-accent/5">
              {type === "track" ? t('curriculum_track') : t('teaching_path_label')}
            </span>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center mb-10">
            <span className="h-px w-10 bg-foreground/20" />
            <span className="mx-3 text-foreground/30 text-xs">✦</span>
            <span className="h-px w-10 bg-foreground/20" />
          </div>

          {!curriculum && (
            <div className="py-16 text-center">
              <p className="text-[15px] text-white/70 leading-relaxed">
                {t('coming_soon').replace('{title}', title)}
              </p>
            </div>
          )}

          {curriculum && (
            <>
              {/* Overview */}
              <section className="mb-10">
                <h2 className="text-[11px] uppercase tracking-[0.3em] text-accent mb-4 font-semibold flex items-center justify-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  {t('curriculum_overview')}
                </h2>
                <p className="text-center text-[14px] text-white/70 leading-relaxed mb-5">
                  {t('curriculum_overview_desc')}
                </p>
                <div className="flex justify-center gap-6 text-center">
                  <div>
                    <p className="text-2xl font-semibold text-white">{curriculum.modules.length}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1">{t('modules')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-white">{totalLessons}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1">{t('lessons')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-accent">{completedLessons.size}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1">{t('completed')}</p>
                  </div>
                </div>
              </section>

              {/* Divider */}
              <div className="flex items-center justify-center mb-10">
                <span className="h-px w-10 bg-foreground/20" />
                <span className="mx-3 text-foreground/30 text-xs">✦</span>
                <span className="h-px w-10 bg-foreground/20" />
              </div>

              {/* Modules */}
              <div className="space-y-8">
                {curriculum.modules.map((module, moduleIdx) => (
                  <section key={module.id}>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-accent/80 mb-2">
                      {t('module')} {moduleIdx + 1}
                    </p>
                    <h2 className="text-xl font-semibold text-white mb-2 leading-tight">
                      {module.title}
                    </h2>
                    <p className="text-[14px] text-white/65 leading-relaxed mb-5">
                      {module.description}
                    </p>

                    <Accordion type="single" collapsible className="space-y-2">
                      {module.lessons.map((lesson, lessonIdx) => {
                        const isCompleted = completedLessons.has(lesson.id);
                        return (
                          <AccordionItem
                            key={lesson.id}
                            value={lesson.id}
                            className="border border-white/10 rounded-2xl px-4 bg-white/[0.03] backdrop-blur-sm"
                          >
                            <AccordionTrigger className="hover:no-underline py-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLessonComplete(lesson.id);
                                  }}
                                  className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                                    isCompleted
                                      ? "bg-accent text-accent-foreground"
                                      : "bg-white/10 text-white/80 ring-1 ring-white/15 hover:bg-white/15"
                                  }`}
                                  aria-label={isCompleted ? t('mark_incomplete') : t('mark_complete')}
                                >
                                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : lessonIdx + 1}
                                </button>
                                <div className="text-left flex-1 min-w-0">
                                  <div className="font-medium text-white text-[14.5px] leading-snug">
                                    {lesson.title}
                                  </div>
                                  <div className="text-[12.5px] text-white/55 mt-0.5 leading-snug line-clamp-2">
                                    {lesson.description}
                                  </div>
                                </div>
                                <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-white/50 px-2 py-0.5 rounded-full border border-white/10">
                                  {lesson.duration}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-5 space-y-5">
                              <div className="space-y-3">
                                <h4 className="text-[10px] uppercase tracking-[0.3em] text-accent font-semibold">
                                  {t('lesson_content')}
                                </h4>
                                {lesson.content.map((paragraph, idx) => (
                                  <p key={idx} className="text-[14px] leading-[1.8] text-white/85">
                                    {paragraph}
                                  </p>
                                ))}
                              </div>

                              {lesson.exercises && lesson.exercises.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-white/10">
                                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-accent font-semibold">
                                    {t('practice_exercises')}
                                  </h4>
                                  <ul className="space-y-2">
                                    {lesson.exercises.map((exercise, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-[14px] text-white/80">
                                        <span className="text-accent font-bold leading-relaxed">•</span>
                                        <span className="leading-relaxed">{exercise}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  onClick={() => toggleLessonComplete(lesson.id)}
                                  className={
                                    isCompleted
                                      ? "bg-white/10 text-white border border-white/15 hover:bg-white/15"
                                      : "bg-accent text-accent-foreground hover:bg-accent/90"
                                  }
                                >
                                  {isCompleted ? t('mark_incomplete') : t('mark_complete')}
                                </Button>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <PremiumNav />
    </div>
  );
};

export default LogosLearning;
