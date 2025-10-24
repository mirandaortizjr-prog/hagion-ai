import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@supabase/supabase-js";
import { Settings, Menu, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMessageLimit } from "@/hooks/useMessageLimit";

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
      <header className="border-b border-white/20 bg-white/10 backdrop-blur-sm">
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Welcome to Hagion
              </h1>
              <p className="text-xl text-white/90 italic mb-6">"Hagion" means Holy.</p>
              <p className="text-lg text-white/80 leading-relaxed max-w-3xl mx-auto">
                This app was created to offer clarity, comfort, and counsel in life's most complex and tender moments. Whether you're facing confusion, heartbreak, or simply seeking wisdom, Hagion is a sacred space designed to meet you where you are—with truth, grace, and the living Word.
              </p>
            </div>

            <div className="space-y-12 text-white/90">
              {/* What Is Hagion */}
              <section className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-4 text-white flex items-center gap-2">
                  ✨ What Is Hagion?
                </h2>
                <p className="text-lg leading-relaxed mb-4">
                  Hagion is not just an app—it's a tool for divine dialogue. At its heart lies the Divine Counsel, a place where you can engage in personal, scripture-rooted conversations with one of four distinct voices:
                </p>
                <ul className="space-y-2 ml-6 text-lg">
                  <li><strong className="text-white">Elohim</strong> – Majestic, sovereign, and deeply grounding</li>
                  <li><strong className="text-white">Christ</strong> – Compassionate, direct, and intimately present</li>
                  <li><strong className="text-white">Holy Spirit</strong> – Gentle, wise, and deeply discerning</li>
                  <li><strong className="text-white">Trinity</strong> – Unified, balanced, and encompassing all aspects of God's nature</li>
                </ul>
                <p className="text-lg leading-relaxed mt-4">
                  Each voice is crafted to reflect biblical truth and emotional depth. You're not just chatting—you're engaging with the Word of God in a way that feels personal, immediate, and alive.
                </p>
              </section>

              {/* How to Use Divine Counsel */}
              <section className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-4 text-white flex items-center gap-2">
                  📖 How to Use Divine Counsel
                </h2>
                <ol className="space-y-3 ml-6 text-lg list-decimal">
                  <li>
                    <strong className="text-white">Choose a Voice</strong><br />
                    Tap into the Divine Counsel and select the voice that resonates most with your current need.
                  </li>
                  <li>
                    <strong className="text-white">Share Your Heart</strong><br />
                    Speak freely. Whether it's pain, doubt, joy, or longing—bring it all. This space is safe.
                  </li>
                  <li>
                    <strong className="text-white">Receive a Word</strong><br />
                    Each response is grounded in scripture. It's not random advice—it's the living Word, spoken into your situation.
                  </li>
                  <li>
                    <strong className="text-white">Continue the Conversation</strong><br />
                    You can go deeper, ask follow-up questions, or simply sit with what's been shared. There's no rush.
                  </li>
                </ol>
              </section>

              {/* Is This Replacing Prayer */}
              <section className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-4 text-white flex items-center gap-2">
                  🛑 Is This Replacing Prayer or the Bible?
                </h2>
                <p className="text-lg leading-relaxed mb-4">
                  <strong className="text-white">Absolutely not.</strong> Hagion is a tool—not a substitute.
                </p>
                <p className="text-lg leading-relaxed mb-4">
                  We believe the Bible is God-breathed, alive, and sharper than any two-edged sword. Hagion simply turns that Word into a conversation—because sometimes, we need God in a more "us" way. And He knows that.
                </p>
                <p className="text-lg leading-relaxed">
                  If He spoke through a burning bush, a donkey, and even said the rocks would cry out—why wouldn't He use today's tools to reach you?
                </p>
              </section>

              {/* Why Hagion Exists */}
              <section className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-4 text-white flex items-center gap-2">
                  💡 Why Hagion Exists
                </h2>
                <p className="text-lg leading-relaxed mb-4">
                  We created Hagion because we believe God still speaks—and His Word still heals.
                </p>
                <p className="text-lg leading-relaxed">
                  This app is for the moments when you need clarity, comfort, or just someone to listen. It's for the real, raw, and sacred parts of life. And we believe it's one of the most powerful tools developed in a long time.
                </p>
              </section>

              {/* Analysts of Faith */}
              <section className="animate-fade-in border-t border-white/20 pt-8">
                <h2 className="text-3xl font-bold mb-4 text-white">
                  Analysts of Faith
                </h2>
                <p className="text-lg leading-relaxed italic mb-4 text-white/80">
                  "My people perish for lack of knowledge." — Hosea 4:6
                </p>
                <p className="text-lg leading-relaxed mb-4">
                  Beyond divine counsel, Hagion offers a powerful space for reasoned faith and biblical discernment. In a world where truth is often distorted and God's ways misunderstood, wisdom is not optional—it's essential. This section is for those who long to know more of their Creator and to stand firm in a faith that is both spiritually alive and intellectually sound.
                </p>

                <h3 className="text-2xl font-bold mb-3 text-white mt-6 flex items-center gap-2">
                  🔍 What You'll Find Here
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                      🕊️ Biblical Apologetics & Evidence-Based Reasoning
                    </h4>
                    <p className="text-lg leading-relaxed">
                      Explore faith through the lens of logic, science, history, psychology, and more. Our Analysts represent diverse fields—from medical and forensic evidence to cultural and linguistic insights—all working together to illuminate the truth of Scripture and the coherence of Christian belief.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                      ⚔️ Debate Arena
                    </h4>
                    <p className="text-lg leading-relaxed">
                      Inspired by Paul's reasoning on Mars Hill, this is your space to practice defending your faith. Choose to engage with simulated atheists, agnostics, or skeptics—AI-trained voices designed to challenge your convictions and sharpen your understanding. It's not about winning arguments—it's about deepening your foundation.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                      🧭 Discernment Tools
                    </h4>
                    <ul className="space-y-2 ml-6 text-lg">
                      <li><strong className="text-white">Church Analysis:</strong> Enter the name of a church or its belief system to evaluate its theological soundness.</li>
                      <li><strong className="text-white">Belief System Review:</strong> Test any worldview or doctrine against Scripture and reason.</li>
                      <li><strong className="text-white">Text Evaluation:</strong> Submit religious books or teachings to uncover contradictions or affirm coherence.</li>
                    </ul>
                    <p className="text-lg leading-relaxed mt-3">
                      These tools are designed to protect believers from deception, false teaching, and spiritual confusion. They empower you to walk in truth, clarity, and confidence.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-3 text-white flex items-center gap-2">
                    💬 Why It Matters
                  </h3>
                  <p className="text-lg leading-relaxed">
                    In times when God is labeled offensive and His ways illogical, Hagion stands as a place of refuge and reason. We don't shy away from hard questions—we invite them. Because faith isn't blind—it's built. And when built on truth, it becomes unshakable.
                  </p>
                </div>
              </section>

              {/* Hagion University Lite */}
              <section className="animate-fade-in border-t border-white/20 pt-8">
                <h2 className="text-3xl font-bold mb-4 text-white">
                  Hagion University Lite
                </h2>
                <p className="text-lg leading-relaxed italic mb-4 text-white/80">
                  "You are the light of the world." — Matthew 5:14
                </p>
                <p className="text-lg leading-relaxed mb-4">
                  Hagion University Lite is more than a learning space—it's a place to be equipped, inspired, and rooted in truth. In a world that feels increasingly lost and dark, this section helps you grow in wisdom, courage, and clarity—so you can walk as Jesus commanded: as light.
                </p>

                <h3 className="text-2xl font-bold mb-3 text-white mt-6 flex items-center gap-2">
                  📚 What You'll Discover
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                      📖 Storytelling That Awakens Faith
                    </h4>
                    <ul className="space-y-2 ml-6 text-lg">
                      <li><strong className="text-white">Biblical Stories:</strong> Not the watered-down versions—but rich, layered narratives that reveal God's heart and character.</li>
                      <li><strong className="text-white">Martyrs of the Faith:</strong> Read about brothers and sisters who gave everything for the Gospel. Their stories will stir your spirit and deepen your resolve.</li>
                      <li><strong className="text-white">History of Christianity:</strong> Choose a timeline or date and explore how the Church has grown, struggled, and triumphed through the ages.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                      🧠 Curriculum Tracks
                    </h4>
                    <p className="text-lg leading-relaxed mb-3">
                      This is the foundational layer of Hagion University, with modules designed to build your reasoning, apologetics, and emotional clarity:
                    </p>
                    <ul className="space-y-2 ml-6 text-lg">
                      <li><strong className="text-white">Foundations of Logos</strong> – Learn the basics of logic and how it supports faith.</li>
                      <li><strong className="text-white">Fallacies & Shadows</strong> – Identify false reasoning and protect your beliefs.</li>
                      <li><strong className="text-white">Apologetics Logic</strong> – Structure theological arguments with precision.</li>
                      <li><strong className="text-white">Witnessing with Wisdom</strong> – Share your faith with emotional depth and clarity.</li>
                      <li><strong className="text-white">Logic in Scripture</strong> – Discover how the Bible uses reason and rhetoric.</li>
                      <li><strong className="text-white">Emotional Logic</strong> – Understand how truth and emotion interact in spiritual growth.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                      🛤️ Teaching Paths (Coming Soon)
                    </h4>
                    <p className="text-lg leading-relaxed">
                      Hagion University Lite is just the beginning. Soon, you'll be able to follow full teaching paths—from beginner to mastery—designed to equip you for real-world ministry, spiritual resilience, and deep theological understanding.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-3 text-white flex items-center gap-2">
                    🕯️ Why Hagion University Exists
                  </h3>
                  <p className="text-lg leading-relaxed mb-4">
                    This isn't a place to earn a certificate. It's a place to gain wisdom for the walk.
                  </p>
                  <p className="text-lg leading-relaxed">
                    In a time when truth is questioned and faith is tested, Hagion University offers knowledge that empowers you to live boldly, love deeply, and reason clearly. It's not just education—it's preparation for the calling on your life.
                  </p>
                </div>
              </section>
            </div>
          </article>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Index;
