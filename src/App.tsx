import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppsProvider } from "@/context/AppsContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import AppsPage from "@/pages/AppsPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfilePage from "@/pages/ProfilePage";
import IdContactPage from "@/pages/IdContactPage";
import AboutPage from "@/pages/AboutPage";
import EmailBozzerPage from "@/pages/EmailBozzerPage";
import AdminPage from "@/pages/AdminPage";
import PreventiviPage from "@/pages/PreventiviPage";
import NuovoPreventivoPage from "@/pages/NuovoPreventivoPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-lg gradient-accent animate-pulse" />
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;

  return (
    <AppsProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/apps" element={<AppsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/id-contact" element={<IdContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/email-bozzer" element={<EmailBozzerPage />} />
          <Route path="/preventivi" element={<PreventiviPage />} />
          <Route path="/preventivi/nuovo" element={<NuovoPreventivoPage />} />
          <Route path="/preventivi/modifica/:id" element={<NuovoPreventivoPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppsProvider>
  );
}

function AuthRoute() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/" replace />;
  return <AuthPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
