import { useState } from "react";
import { Bell, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { differenceInDays } from "date-fns";

type Regime = "Tutti" | "Forfettario" | "Ordinario" | "Con dipendenti" | "Con immobili";

interface Deadline {
  date: string;
  name: string;
  tags: Regime[];
}

const deadlines2026: Deadline[] = [
  // Monthly F24
  ...Array.from({ length: 12 }, (_, i) => ({
    date: `2026-${String(i + 1).padStart(2, "0")}-16`,
    name: "F24 ritenute d'acconto",
    tags: ["Con dipendenti"] as Regime[],
  })),
  { date: "2026-06-30", name: "Saldo IRPEF 2025 + I acconto 2026", tags: ["Forfettario", "Ordinario"] },
  { date: "2026-06-30", name: "Contributi INPS Gestione Separata — saldo", tags: ["Tutti"] },
  { date: "2026-09-30", name: "Presentazione Modello Redditi PF", tags: ["Tutti"] },
  { date: "2026-11-30", name: "II acconto IRPEF 2026", tags: ["Tutti"] },
  { date: "2026-12-16", name: "Saldo IMU", tags: ["Con immobili"] },
];

const months = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

const filters = ["Tutte", "Forfettario", "Ordinario"] as const;

export default function ScadenzarioPage() {
  const [filter, setFilter] = useState<string>("Forfettario");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showNotify, setShowNotify] = useState(false);
  const navigate = useNavigate();

  const filtered = deadlines2026.filter((d) => {
    if (filter === "Tutte") return true;
    return d.tags.includes("Tutti") || d.tags.includes(filter as Regime);
  });

  const byMonth = months.map((name, i) => ({
    name,
    deadlines: filtered.filter((d) => new Date(d.date).getMonth() === i).sort((a, b) => a.date.localeCompare(b.date)),
  }));

  const getBorderColor = (dateStr: string) => {
    const days = differenceInDays(new Date(dateStr), new Date());
    if (days <= 7) return "border-l-destructive";
    if (days <= 30) return "border-l-accent-orange";
    return "border-l-border";
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Scadenzario 2026</h1>
        <p className="text-muted-foreground text-sm mt-1">Tutte le scadenze fiscali per freelancer.</p>
      </div>

      {/* Filters + Notify */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                filter === f ? "gradient-accent text-foreground font-medium" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setShowNotify(true)} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-colors">
          <Bell className="w-3.5 h-3.5" /> Attiva notifiche
        </button>
      </div>

      {/* Months accordion */}
      <div className="space-y-2">
        {byMonth.map((month, i) => (
          <div key={i} className="rounded-xl bg-card border border-border/50 shadow-card overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground text-sm">{month.name}</h3>
                {month.deadlines.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent-orange/15 text-accent-orange-text font-medium">
                    {month.deadlines.length} scadenz{month.deadlines.length === 1 ? "a" : "e"}
                  </span>
                )}
              </div>
              {expanded === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {expanded === i && month.deadlines.length > 0 && (
              <div className="px-4 pb-4 space-y-2">
                {month.deadlines.map((d, j) => (
                  <div key={j} className={`flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border-l-4 ${getBorderColor(d.date)}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(d.date).toLocaleDateString("it-IT", { day: "numeric", month: "long" })}</p>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {d.tags.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {expanded === i && month.deadlines.length === 0 && (
              <div className="px-4 pb-4">
                <p className="text-sm text-muted-foreground">Nessuna scadenza questo mese.</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fiscola CTA */}
      <div
        onClick={() => navigate("/advisor")}
        className="flex items-center gap-3 p-4 rounded-xl bg-accent-orange/10 cursor-pointer hover:bg-accent-orange/15 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: "#1B4FDB" }}>
          FI
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Hai dubbi su una scadenza?</p>
          <p className="text-xs text-muted-foreground">Chiedilo a Fiscola →</p>
        </div>
        <MessageCircle className="w-5 h-5 text-accent-orange-text shrink-0" />
      </div>

      {/* Notify modal */}
      {showNotify && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent-orange-text" />
              <h3 className="font-semibold text-foreground">Attiva notifiche</h3>
            </div>
            <p className="text-sm text-muted-foreground">Ricevi un reminder 7 e 30 giorni prima di ogni scadenza.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowNotify(false)} className="flex-1 text-sm px-4 py-2 rounded-lg gradient-accent text-foreground font-medium">Attiva Notifiche</button>
              <button onClick={() => setShowNotify(false)} className="text-sm px-4 py-2 rounded-lg border border-border text-muted-foreground">Chiudi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
