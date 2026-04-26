import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { useNativeInit } from "@/hooks/useNativeFeatures";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PageTransition } from "@/components/PageTransition";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Discernment from "./pages/Discernment";
import Learning from "./pages/Learning";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import MainMenu from "./pages/MainMenu";
import Settings from "./pages/Settings";
import History from "./pages/History";
import Saved from "./pages/Saved";
import SharedContent from "./pages/SharedContent";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Support from "./pages/Support";
import ApologeticsDebate from "./pages/ApologeticsDebate";
import DivineGuidance from "./pages/DivineGuidance";
import Discern from "./pages/Discern";
import DivineChat from "./pages/DivineChat";
import Chat from "./pages/Chat";
import Premium from "./pages/Premium";
import AssistantChat from "./pages/AssistantChat";
import StorytellingChat from "./pages/StorytellingChat";
import LogosCircle from "./pages/LogosCircle";
import LogosLearning from "./pages/LogosLearning";
import BibleTranslations from "./pages/BibleTranslations";
import ScriptureReader from "./pages/ScriptureReader";
import PublicSpeaking from "./pages/PublicSpeaking";
import TestSpirits from "./pages/TestSpirits";
import SermonAnalyzer from "./pages/SermonAnalyzer";
import PrayerWall from "./pages/PrayerWall";
import PrayerWallPage from "./pages/PrayerWallPage";
import DailyWisdom from "./pages/DailyWisdom";
import DailyDevotional from "./pages/DailyDevotional";
import Library from "./pages/Library";
import PostDetailPage from "./pages/community/PostDetailPage";
import DiscussionsPage from "./pages/community/DiscussionsPage";
import ReelsFeedPage from "./pages/community/ReelsFeedPage";
import VideosPage from "./pages/community/VideosPage";
import LivePage from "./pages/community/LivePage";
import TeachingDetailPage from "./pages/community/TeachingDetailPage";
import GroupDetailPage from "./pages/community/GroupDetailPage";
import GroupsPage from "./pages/community/GroupsPage";
import EventDetailPage from "./pages/community/EventDetailPage";
import ChurchDetailPage from "./pages/community/ChurchDetailPage";
import MessengerPage from "./pages/community/MessengerPage";
import Friends from "./pages/Friends";
import PublicProfile from "./pages/PublicProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle onboarding redirect
const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("onboardingCompleted");
    const exemptRoutes = ["/", "/index", "/home", "/splash", "/onboarding", "/auth"];
    
    if (!onboardingCompleted && !exemptRoutes.includes(location.pathname)) {
      navigate("/onboarding", { replace: true });
    }
  }, [location, navigate]);

  return <>{children}</>;
};

// Component to initialize native features
const NativeAppWrapper = ({ children }: { children: React.ReactNode }) => {
  useNativeInit();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <PremiumProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <BrowserRouter>
            <NativeAppWrapper>
            <OnboardingGuard>
            <PageTransition>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/index" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<Index />} />
            <Route path="/discernment" element={<Discernment />} />
            <Route path="/discernment/test-spirits" element={<TestSpirits />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/community" element={<PrayerWall />} />
            <Route path="/splash" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/main-menu" element={<MainMenu />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/support" element={<Support />} />
            <Route path="/history" element={<History />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/shared" element={<SharedContent />} />
            <Route path="/discern" element={<Discern />} />
            <Route path="/divine-guidance" element={<DivineGuidance />} />
            <Route path="/divine/:voiceId" element={<DivineChat />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/apologetics-debate" element={<ApologeticsDebate />} />
            <Route path="/logos-circle" element={<LogosCircle />} />
            <Route path="/logos-circle/:type/:id" element={<LogosLearning />} />
            <Route path="/bible-translations" element={<BibleTranslations />} />
            <Route path="/scripture/:textId" element={<ScriptureReader />} />
            <Route path="/public-speaking" element={<PublicSpeaking />} />
            <Route path="/prayer-wall" element={<PrayerWallPage />} />
            <Route path="/daily-wisdom" element={<DailyWisdom />} />
            <Route path="/daily-devotional" element={<DailyDevotional />} />
            <Route path="/library" element={<Library />} />
            <Route path="/community/discussions" element={<DiscussionsPage />} />
            <Route path="/community/post/:id" element={<PostDetailPage />} />
            <Route path="/community/reels" element={<ReelsFeedPage />} />
            <Route path="/community/reels/feed" element={<ReelsFeedPage />} />
            <Route path="/community/videos" element={<VideosPage />} />
            <Route path="/community/live" element={<LivePage />} />
            <Route path="/community/teaching/:id" element={<TeachingDetailPage />} />
            <Route path="/community/groups" element={<GroupsPage />} />
            <Route path="/community/group/:id" element={<GroupDetailPage />} />
            <Route path="/community/event/:id" element={<EventDetailPage />} />
            <Route path="/community/church/:id" element={<ChurchDetailPage />} />
            <Route path="/community/messenger" element={<MessengerPage />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/u/:handle" element={<PublicProfile />} />
            <Route path="/storytelling/:storyId" element={<StorytellingChat />} />
            <Route path="/:assistantId" element={<AssistantChat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </PageTransition>
          </OnboardingGuard>
          </NativeAppWrapper>
        </BrowserRouter>
        </TooltipProvider>
      </PremiumProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
