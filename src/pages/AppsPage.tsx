import { useState } from "react";
import { Users, FileText, Mail, UserCheck, Calendar, Newspaper, Landmark, LayoutGrid } from "lucide-react";

interface AppItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
}

const initialApps: AppItem[] = [
  {
    id: "id-contact",
    name: "ID Contact",
    description: "Rubrica clienti e contatti professionali",
    icon: <Users className="w-6 h-6" />,
    active: true,
  },
  {
    id: "preventivi",
    name: "Preventivi",
    description: "Crea e gestisci i tuoi preventivi",
    icon: <FileText className="w-6 h-6" />,
    active: true,
  },
  {
    id: "email-bozze",
    name: "Email Bozze",
    description: "Bozze email pronte da inviare",
    icon: <Mail className="w-6 h-6" />,
    active: true,
  },
  {
    id: "lead-clients",
    name: "Lead & Clients",
    description: "Gestisci lead e converti in clienti",
    icon: <UserCheck className="w-6 h-6" />,
    active: false,
  },
  {
    id: "eventi-news",
    name: "Eventi e News",
    description: "Resta aggiornato su eventi e novità",
    icon: <Calendar className="w-6 h-6" />,
    active: false,
  },
  {
    id: "bandi",
    name: "Bandi",
    description: "Scopri bandi e opportunità di finanziamento",
    icon: <Landmark className="w-6 h-6" />,
    active: false,
  },
  {
    id: "smm-planner",
    name: "SMM Planner",
    description: "Pianifica i tuoi contenuti social media",
    icon: <LayoutGrid className="w-6 h-6" />,
    active: false,
  },
];

const AppsPage = () => {
  const [apps, setApps] = useState(initialApps);

  const toggle = (id: string) => {
    setApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, active: !app.active } : app))
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Apps</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestisci i tuoi strumenti di lavoro
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className={`relative p-5 rounded-xl border transition-all shadow-card hover:shadow-card-hover ${
              app.active ? "border-accent-green/30 bg-card" : "border-border bg-secondary/30"
            }`}
          >
            <span
              className={`absolute top-4 right-4 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                app.active
                  ? "gradient-accent text-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {app.active ? "Attivo" : "Inattivo"}
            </span>

            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 ${
                app.active
                  ? "bg-accent-green/10 text-accent-green"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {app.icon}
            </div>

            <h3 className="font-semibold text-foreground text-sm">{app.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">{app.description}</p>

            <button
              onClick={() => toggle(app.id)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                app.active ? "gradient-accent" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-card rounded-full shadow transition-transform ${
                  app.active ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppsPage;
