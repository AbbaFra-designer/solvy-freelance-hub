import { createContext, useContext, useState, ReactNode } from "react";
import { Users, FileText, Mail, UserCheck, Calendar, Landmark, LayoutGrid } from "lucide-react";

export interface AppItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  free: boolean;
}

const initialApps: AppItem[] = [
  { id: "id-contact", name: "ID Contact", description: "Rubrica clienti e contatti professionali", icon: <Users className="w-6 h-6" />, active: true, free: true },
  { id: "email-bozzer", name: "Email Bozzer", description: "Bozze email pronte da inviare", icon: <Mail className="w-6 h-6" />, active: true, free: true },
  { id: "preventivi", name: "Preventivi", description: "Crea e gestisci i tuoi preventivi", icon: <FileText className="w-6 h-6" />, active: true, free: false },
  { id: "lead-clients", name: "Lead & Clients", description: "Gestisci lead e converti in clienti", icon: <UserCheck className="w-6 h-6" />, active: false, free: false },
  { id: "eventi-news", name: "Eventi e News", description: "Resta aggiornato su eventi e novità", icon: <Calendar className="w-6 h-6" />, active: false, free: false },
  { id: "bandi", name: "Bandi & Finanziamenti", description: "Bandi, premi e finanziamenti per designer e freelance", icon: <Landmark className="w-6 h-6" />, active: true, free: true },
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
