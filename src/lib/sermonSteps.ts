// Shared definitions for Sermon Lab steps. Used across PublicSpeaking, SermonWorkspace, SermonStepEditor, SermonRefine.
export type SermonStepDef = {
  num: number;
  key:
    | "step_1" | "step_2" | "step_3" | "step_4" | "step_5"
    | "step_6" | "step_7" | "step_8" | "step_9" | "step_10";
  title: string;
  desc: string;
  prompt: string;
};

export const SERMON_STEPS: SermonStepDef[] = [
  {
    num: 1, key: "step_1",
    title: "Prayer & Scripture",
    desc: "Begin with prayer and select a biblical passage.",
    prompt: "Write a short note about your prayer time and the Scripture passage God placed on your heart. Include the reference.",
  },
  {
    num: 2, key: "step_2",
    title: "Study the Text",
    desc: "Research historical context, original language, and theological meaning.",
    prompt: "Capture historical context, audience, genre, and any insights from original languages or commentaries.",
  },
  {
    num: 3, key: "step_3",
    title: "Identify the Main Point",
    desc: "Determine the central message God wants to communicate.",
    prompt: "State, in one sentence, the central truth this sermon will proclaim.",
  },
  {
    num: 4, key: "step_4",
    title: "Structure the Sermon",
    desc: "Outline introduction, main points, and conclusion.",
    prompt: "Sketch the outline: hook, main points (2–4), and conclusion.",
  },
  {
    num: 5, key: "step_5",
    title: "Develop Applications",
    desc: "Show how the text applies to modern life.",
    prompt: "List concrete ways this text calls believers to think, live, and respond today.",
  },
  {
    num: 6, key: "step_6",
    title: "Add Illustrations",
    desc: "Use stories and examples to make points memorable.",
    prompt: "Note stories, analogies, or examples that make the truth tangible.",
  },
  {
    num: 7, key: "step_7",
    title: "Write the Introduction",
    desc: "Hook the audience and introduce the topic.",
    prompt: "Draft your opening — the hook, the tension, and the entry into the text.",
  },
  {
    num: 8, key: "step_8",
    title: "Write the Body",
    desc: "Expand each point with scripture and explanation.",
    prompt: "Write the full body of the sermon, point by point, with Scripture and explanation.",
  },
  {
    num: 9, key: "step_9",
    title: "Write the Conclusion",
    desc: "Summarize and call the listener to action.",
    prompt: "Draft the conclusion: summary, gospel call, and response.",
  },
  {
    num: 10, key: "step_10",
    title: "Review & Refine",
    desc: "Edit for clarity, timing, and theological accuracy.",
    prompt: "Notes from your own review pass — what to tighten, cut, or strengthen.",
  },
];

export type SermonDraft = {
  id: string;
  user_id: string;
  title: string;
  scripture_ref: string | null;
  step_1: string; step_2: string; step_3: string; step_4: string; step_5: string;
  step_6: string; step_7: string; step_8: string; step_9: string; step_10: string;
  assembled_text: string | null;
  ai_feedback: string | null;
  ai_rewrite: string | null;
  created_at: string;
  updated_at: string;
};

export function assembleSermon(d: SermonDraft): string {
  const sections: string[] = [];
  sections.push(`# ${d.title}`);
  if (d.scripture_ref) sections.push(`*${d.scripture_ref}*`);
  for (const step of SERMON_STEPS) {
    const text = (d as any)[step.key]?.trim();
    if (!text) continue;
    sections.push(`\n## ${step.num}. ${step.title}\n\n${text}`);
  }
  return sections.join("\n");
}
