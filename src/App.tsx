import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Splash from "./pages/Splash";
import MainMenu from "./pages/MainMenu";
import Settings from "./pages/Settings";
import History from "./pages/History";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Support from "./pages/Support";
import ApologeticsDebate from "./pages/ApologeticsDebate";
import DivineGuidance from "./pages/DivineGuidance";
import DivineChat from "./pages/DivineChat";
import Chat from "./pages/Chat";
import Premium from "./pages/Premium";
import AssistantChat from "./pages/AssistantChat";
import StorytellingChat from "./pages/StorytellingChat";
import NotFound from "./pages/NotFound";
import LanguageToggle from "./components/LanguageToggle";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageToggle />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/splash" replace />} />
            <Route path="/splash" element={<Splash />} />
            <Route path="/main-menu" element={<MainMenu />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/support" element={<Support />} />
            <Route path="/history" element={<History />} />
            <Route path="/divine-guidance" element={<DivineGuidance />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/apologetics-debate" element={<ApologeticsDebate />} />
            <Route path="/:assistantId" element={<AssistantChat />} />
            <Route path="/storytelling/:storyId" element={<StorytellingChat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
