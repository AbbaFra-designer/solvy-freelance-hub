import { useState } from "react";
import { Star, CheckCircle, ExternalLink } from "lucide-react";

interface Professional {
  name: string;
  city: string;
  specialization: string;
  rating: number;
  reviews: number;
  verified: boolean;
  initials: string;
  color: string;
}

const data: Record<string, Professional[]> = {
  Commercialisti: [
    { name: "Dott. Marco Bianchi", city: "Milano", specialization: "Regime Forfettario · P.IVA Startup", rating: 4.8, reviews: 12, verified: true, initials: "MB", color: "#1B4FDB" },
    { name: "Dott.ssa Sara Conti", city: "Roma · Online", specialization: "E-commerce · Influencer", rating: 4.6, reviews: 8, verified: false, initials: "SC", color: "#7C4DFF" },
  ],
  Avvocati: [
    { name: "Avv. Giulia Rossi", city: "Milano · Online", specialization: "GDPR · Contratti Freelance", rating: 4.9, reviews: 15, verified: true, initials: "GR", color: "#1A7A4A" },
    { name: "Avv. Luca Ferraro", city: "Torino", specialization: "AI Act · Proprietà Intellettuale", rating: 4.7, reviews: 6, verified: true, initials: "LF", color: "#FF6B4A" },
  ],
  Coach: [
    { name: "Elena Marchetti", city: "Online", specialization: "Mindset · Produttività Freelance", rating: 4.5, reviews: 20, verified: true, initials: "EM", color: "#FF6B4A" },
    { name: "Davide Moretti", city: "Bologna · Online", specialization: "Career Coaching · Personal Brand", rating: 4.3, reviews: 4, verified: false, initials: "DM", color: "#1B4FDB" },
  ],
};

const tabs = ["Commercialisti", "Avvocati", "Coach"] as const;
const cityFilters = ["Tutti", "✅ Verificati", "Milano", "Roma", "Online"] as const;

export default function ProfessionistiPage() {
  const [tab, setTab] = useState<string>("Commercialisti");
  const [cityFilter, setCityFilter] = useState("Tutti");

  const filtered = (data[tab] || []).filter((p) => {
    if (cityFilter === "Tutti") return true;
    if (cityFilter === "✅ Verificati") return p.verified;
    return p.city.includes(cityFilter);
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Pronto per il prossimo step?</h1>
        <p className="text-muted-foreground text-sm mt-1">Professionisti selezionati da Solvy, valutati dalla community.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm px-4 py-2 rounded-lg transition-colors ${
              tab === t ? "gradient-accent text-foreground font-medium" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* City filters */}
      <div className="flex gap-2 flex-wrap">
        {cityFilters.map((f) => (
          <button
            key={f}
            onClick={() => setCityFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              cityFilter === f ? "bg-foreground text-background font-medium" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.map((p) => (
          <div key={p.name} className="p-5 rounded-xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: p.color }}>
                {p.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground">{p.name}</h3>
                  <span className="text-xs text-muted-foreground">· {p.city}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{p.specialization}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-accent-orange fill-accent-orange" />
                    <span className="text-sm font-medium text-foreground">{p.rating}</span>
                    <span className="text-xs text-muted-foreground">— {p.reviews} recensioni</span>
                  </div>
                  {p.verified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent-green/15 text-accent-green-text">
                      <CheckCircle className="w-3 h-3" /> Verificato Solvy
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Profilo Base</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button className="text-sm font-medium px-4 py-2 rounded-lg gradient-accent text-foreground hover:opacity-90 transition-opacity">
                    Contatta
                  </button>
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    Vedi profilo <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Partner CTA */}
      <div className="p-5 rounded-xl bg-secondary border border-border">
        <h3 className="font-semibold text-foreground">Sei un professionista?</h3>
        <p className="text-sm text-muted-foreground mt-1">Unisciti alla rete Solvy e ricevi lead qualificati dalla community.</p>
        <button className="mt-3 text-sm font-medium px-4 py-2 rounded-lg border border-border text-foreground hover:bg-card transition-colors">
          Registrati come partner →
        </button>
      </div>
    </div>
  );
}
