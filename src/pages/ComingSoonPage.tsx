import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Sparkles, Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PAGE_META: Record<string, { name: string; description: string; eta: string; color: string }> = {
  "/smm-planner": {
    name: "SMM Planner",
    description: "Pianifica e pubblica i tuoi contenuti social in un unico posto. Calendario editoriale, suggerimenti AI e analitiche integrate.",
    eta: "Estate 2025",
    color: "bg-purple-500/10 text-purple-700",
  },
  "/eventi-news": {
    name: "Eventi & News",
    description: "Rimani aggiornato sugli eventi del settore, conferenze, webinar e novità rilevanti per il tuo lavoro da freelance.",
    eta: "Autunno 2025",
    color: "bg-blue-500/10 text-blue-700",
  },
};

export default function ComingSoonPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notified, setNotified] = useState(false);

  const meta = PAGE_META[location.pathname] ?? {
    name: "In arrivo",
    description: "Questa sezione è in fase di sviluppo e sarà disponibile presto.",
    eta: "Prossimamente",
    color: "bg-secondary text-muted-foreground",
  };

  const handleNotify = () => {
    setNotified(true);
    toast.success("Ti avviseremo non appena la sezione sarà disponibile!");
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${meta.color}`}>
            <Sparkles className="w-9 h-9" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/20">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-pulse" />
          <span className="text-xs font-medium text-accent-orange-text">In sviluppo · {meta.eta}</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{meta.name}</h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">{meta.description}</p>
        </div>

        {/* Feature preview pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {location.pathname === "/smm-planner" && (
            <>
              <FeaturePill label="Calendario editoriale" />
              <FeaturePill label="Suggerimenti AI" />
              <FeaturePill label="Analitiche social" />
              <FeaturePill label="Post scheduling" />
            </>
          )}
          {location.pathname === "/eventi-news" && (
            <>
              <FeaturePill label="Conferenze e webinar" />
              <FeaturePill label="Novità del settore" />
              <FeaturePill label="Notifiche personalizzate" />
              <FeaturePill label="Newsletter curata" />
            </>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Torna indietro
          </button>
          <button
            onClick={handleNotify}
            disabled={notified}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-accent text-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            <Bell className="w-4 h-4" />
            {notified ? "Notifica attivata ✓" : "Avvisami quando è pronto"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeaturePill({ label }: { label: string }) {
  return (
    <span className="text-xs px-3 py-1.5 rounded-full bg-secondary text-muted-foreground border border-border/50">
      {label}
    </span>
  );
}
