import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { curriculumData } from "@/data/curriculumData";

const LogosLearning = () => {
  const navigate = useNavigate();
  const { type, id } = useParams<{ type: string; id: string }>();
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const trackTitles: Record<string, string> = {
    foundations: "Foundations of Logos",
    fallacies: "Fallacies & Shadows",
    apologetics: "Apologetics Logic",
    witnessing: "Witnessing with Wisdom",
    scripture: "Logic in Scripture",
    emotional: "Emotional Logic",
  };

  const pathTitles: Record<string, string> = {
    "apologetics-path": "Apologetics Path",
    "witnessing-path": "Witnessing Path",
    "logic-path": "Logic Path",
    "scriptural-path": "Scriptural Path",
    "ceremonial-path": "Ceremonial Path",
  };

  const title = type === "track" ? trackTitles[id || ""] : pathTitles[id || ""];
  const curriculum = type === "track" && id ? curriculumData[id] : null;

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
        <Button variant="ghost" size="icon" onClick={() => navigate("/logos-circle")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {type === "track" ? "Curriculum Track" : "Teaching Path"}
          </p>
        </div>
      </header>

      {/* Curriculum Content */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {!curriculum && (
            <Card className="bg-violet-500/5 border-violet-500/20">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Welcome to {title}! This learning path is coming soon.
                </p>
              </CardContent>
            </Card>
          )}

          {curriculum && (
            <>
              {/* Introduction Card */}
              <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-violet-500" />
                    Curriculum Overview
                  </CardTitle>
                  <CardDescription>
                    Progress through structured modules and lessons to master this track
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="font-semibold">{curriculum.modules.length}</span> Modules
                    </div>
                    <div>
                      <span className="font-semibold">
                        {curriculum.modules.reduce((acc, mod) => acc + mod.lessons.length, 0)}
                      </span>{" "}
                      Lessons
                    </div>
                    <div>
                      <span className="font-semibold">{completedLessons.size}</span> Completed
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Modules */}
              {curriculum.modules.map((module, moduleIdx) => (
                <Card key={module.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Module {moduleIdx + 1}</Badge>
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
                                <h4 className="font-semibold text-sm">Lesson Content</h4>
                                {lesson.content.map((paragraph, idx) => (
                                  <p key={idx} className="text-sm leading-relaxed">
                                    {paragraph}
                                  </p>
                                ))}
                              </div>

                              {/* Exercises */}
                              {lesson.exercises && lesson.exercises.length > 0 && (
                                <div className="space-y-3 pt-4 border-t">
                                  <h4 className="font-semibold text-sm">Practice Exercises</h4>
                                  <ul className="space-y-2">
                                    {lesson.exercises.map((exercise, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm">
                                        <span className="text-violet-500 font-bold">•</span>
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
                                  {isCompleted ? "Mark Incomplete" : "Mark Complete"}
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
