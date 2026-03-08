import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppsProvider } from "@/context/AppsContext";
import AppLayout from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import AppsPage from "@/pages/AppsPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfilePage from "@/pages/ProfilePage";
import IdContactPage from "@/pages/IdContactPage";
import AboutPage from "@/pages/AboutPage";
import EmailBozzerPage from "@/pages/EmailBozzerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppsProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/id-contact" element={<IdContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/email-bozzer" element={<EmailBozzerPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AppsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
