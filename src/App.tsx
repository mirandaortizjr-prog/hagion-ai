import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Splash from "./pages/Splash";
import MainMenu from "./pages/MainMenu";
import DivineGuidance from "./pages/DivineGuidance";
import DivineChat from "./pages/DivineChat";
import Chat from "./pages/Chat";
import Premium from "./pages/Premium";
import AssistantChat from "./pages/AssistantChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/menu" element={<MainMenu />} />
          <Route path="/divine" element={<DivineGuidance />} />
          <Route path="/divine/:voiceId" element={<DivineChat />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/:assistantId" element={<AssistantChat />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
