import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getCurriculumData } from "@/data/curriculumData";
import { useLanguage } from "@/contexts/LanguageContext";

const LogosLearning = () => {
  const navigate = useNavigate();
  const { type, id } = useParams<{ type: string; id: string }>();
  const { t, language } = useLanguage();
  const curriculumData = getCurriculumData(language);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

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

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate("/main-menu?tab=hagion-university")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {type === "track" ? t('curriculum_track') : t('teaching_path_label')}
          </p>
        </div>
      </header>

      {/* Curriculum Content */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {!curriculum && (
            <Card className="bg-[#3BB4F2]/5 border-[#3BB4F2]/20">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {t('coming_soon').replace('{title}', title)}
                </p>
              </CardContent>
            </Card>
          )}

          {curriculum && (
            <>
              {/* Introduction Card */}
              <Card className="bg-gradient-to-br from-[#3BB4F2]/10 to-[#0052D4]/10 border-[#3BB4F2]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#3BB4F2]" />
                    {t('curriculum_overview')}
                  </CardTitle>
                  <CardDescription>
                    {t('curriculum_overview_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="font-semibold">{curriculum.modules.length}</span> {t('modules')}
                    </div>
                    <div>
                      <span className="font-semibold">
                        {curriculum.modules.reduce((acc, mod) => acc + mod.lessons.length, 0)}
                      </span>{" "}
                      {t('lessons')}
                    </div>
                    <div>
                      <span className="font-semibold">{completedLessons.size}</span> {t('completed')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Modules */}
              {curriculum.modules.map((module, moduleIdx) => (
                <Card key={module.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{t('module')} {moduleIdx + 1}</Badge>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="space-y-2">
                      {module.lessons.map((lesson, lessonIdx) => {
                        const isCompleted = completedLessons.has(lesson.id);
                        return (
                          <AccordionItem
                            key={lesson.id}
                            value={lesson.id}
                            className="border rounded-lg px-4"
                          >
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3 flex-1">
                                <Button
                                  size="sm"
                                  variant={isCompleted ? "default" : "outline"}
                                  className="h-8 w-8 rounded-full p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLessonComplete(lesson.id);
                                  }}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <span className="text-xs">{lessonIdx + 1}</span>
                                  )}
                                </Button>
                                <div className="text-left flex-1">
                                  <div className="font-medium">{lesson.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {lesson.description}
                                  </div>
                                </div>
                                <Badge variant="outline" className="ml-auto">
                                  {lesson.duration}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 space-y-4">
                              {/* Lesson Content */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm">{t('lesson_content')}</h4>
                                {lesson.content.map((paragraph, idx) => (
                                  <p key={idx} className="text-sm leading-relaxed">
                                    {paragraph}
                                  </p>
                                ))}
                              </div>

                              {/* Exercises */}
                              {lesson.exercises && lesson.exercises.length > 0 && (
                                <div className="space-y-3 pt-4 border-t">
                                  <h4 className="font-semibold text-sm">{t('practice_exercises')}</h4>
                                  <ul className="space-y-2">
                                    {lesson.exercises.map((exercise, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm">
                                        <span className="text-[#3BB4F2] font-bold">•</span>
                                        <span>{exercise}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex gap-2 pt-4">
                                <Button
                                  size="sm"
                                  variant={isCompleted ? "outline" : "default"}
                                  onClick={() => toggleLessonComplete(lesson.id)}
                                >
                                  {isCompleted ? t('mark_incomplete') : t('mark_complete')}
                                </Button>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogosLearning;
