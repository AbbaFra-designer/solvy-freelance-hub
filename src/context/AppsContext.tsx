import { createContext, useContext, useState, ReactNode } from "react";
import { Users, FileText, Mail, UserCheck, Calendar, Landmark, LayoutGrid, Bot, Rocket, CalendarClock, Receipt, UsersRound } from "lucide-react";

export interface AppItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  free: boolean;
  url?: string;
}

const initialApps: AppItem[] = [
  { id: "advisor", name: "Advisor AI", description: "Il tuo consulente AI per freelance", icon: <Bot className="w-6 h-6" />, active: false, free: false, url: "/advisor" },
  { id: "kit-partenza", name: "Kit Partenza", description: "Tutto per iniziare la tua attività da freelance", icon: <Rocket className="w-6 h-6" />, active: false, free: false, url: "/kit-partenza" },
  { id: "scadenzario", name: "Scadenzario", description: "Gestisci scadenze fiscali e pagamenti", icon: <CalendarClock className="w-6 h-6" />, active: false, free: false, url: "/scadenzario" },
  { id: "prima-nota", name: "Prima Nota", description: "Registro entrate e uscite semplificato", icon: <Receipt className="w-6 h-6" />, active: false, free: false, url: "/prima-nota" },
  { id: "professionisti", name: "Professionisti", description: "Rete di commercialisti, avvocati e consulenti", icon: <UsersRound className="w-6 h-6" />, active: false, free: false, url: "/professionisti" },
  { id: "id-contact", name: "ID Contact", description: "Rubrica clienti e contatti professionali", icon: <Users className="w-6 h-6" />, active: true, free: true, url: "/id-contact" },
  { id: "email-bozzer", name: "Email Bozzer", description: "Bozze email pronte da inviare", icon: <Mail className="w-6 h-6" />, active: true, free: true, url: "/email-bozzer" },
  { id: "preventivi", name: "Preventivi", description: "Crea e gestisci i tuoi preventivi", icon: <FileText className="w-6 h-6" />, active: true, free: false, url: "/preventivi" },
  { id: "bandi", name: "Bandi & Finanziamenti", description: "Bandi, premi e finanziamenti per designer e freelance", icon: <Landmark className="w-6 h-6" />, active: true, free: true, url: "/bandi" },
  { id: "lead-clients", name: "Lead & Clients", description: "Gestisci lead e converti in clienti", icon: <UserCheck className="w-6 h-6" />, active: false, free: false },
  { id: "eventi-news", name: "Eventi e News", description: "Resta aggiornato su eventi e novità", icon: <Calendar className="w-6 h-6" />, active: false, free: false },
  { id: "smm-planner", name: "SMM Planner", description: "Pianifica i tuoi contenuti social media", icon: <LayoutGrid className="w-6 h-6" />, active: false, free: false },
];

interface AppsContextType {
  apps: AppItem[];
  toggleApp: (id: string) => void;
}

const AppsContext = createContext<AppsContextType | undefined>(undefined);

export const AppsProvider = ({ children }: { children: ReactNode }) => {
  const [apps, setApps] = useState(initialApps);
  const toggleApp = (id: string) =>
    setApps((prev) => prev.map((app) => (app.id === id ? { ...app, active: !app.active } : app)));
  return <AppsContext.Provider value={{ apps, toggleApp }}>{children}</AppsContext.Provider>;
};

export const useApps = () => {
  const ctx = useContext(AppsContext);
  if (!ctx) throw new Error("useApps must be used within AppsProvider");
  return ctx;
};
