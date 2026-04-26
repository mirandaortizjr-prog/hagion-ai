import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { PremiumNav } from "@/components/PremiumNav";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

/**
 * Shared layout for legal documents (Privacy, Terms, Refund, AI Disclaimer).
 * Mirrors the Settings page header style for visual consistency.
 */
export const LegalPage = ({ title, lastUpdated, children }: LegalPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white">
      <header
        className="sticky top-0 z-30 backdrop-blur-2xl bg-black/30 border-b border-white/10"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-playfair tracking-wide flex-1 truncate">{title}</h1>
          <button
            onClick={() => navigate("/home")}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-7 pb-32 pt-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent backdrop-blur-2xl p-6 sm:p-9 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">
            Last updated: {lastUpdated}
          </p>
          <h2 className="text-3xl sm:text-4xl font-playfair mb-6 leading-tight">{title}</h2>
          <div className="prose prose-invert max-w-none text-white/80 leading-relaxed text-[15px] space-y-4 [&_h3]:text-white [&_h3]:font-playfair [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-3 [&_h4]:text-white [&_h4]:font-semibold [&_h4]:text-base [&_h4]:mt-5 [&_h4]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-white/75 [&_strong]:text-white [&_a]:text-primary [&_a]:underline">
            {children}
          </div>
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          © 2025 Hagion AI · All rights reserved
        </p>
      </main>

      <PremiumNav />
    </div>
  );
};
