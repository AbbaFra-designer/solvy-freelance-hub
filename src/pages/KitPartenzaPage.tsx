import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Download } from "lucide-react";

type StepStatus = "done" | "progress" | "missing";
const statusCycle: StepStatus[] = ["missing", "progress", "done"];
const statusIcons: Record<StepStatus, string> = { done: "✅", progress: "⏳", missing: "🔴" };

interface Step {
  emoji: string;
  title: string;
  description: string;
  tips: string[];
  cta?: { label: string; url: string };
  chips?: { label: string; url: string }[];
  secondaryCta?: { label: string };
}

const steps: Step[] = [
  {
    emoji: "🪪", title: "SPID", description: "Identità digitale: ti serve per accedere a tutti i portali PA.",
    cta: { label: "Attiva con Poste Italiane →", url: "https://posteid.poste.it" },
    tips: ["Prepara documento d'identità + tessera sanitaria", "Tempi medi: 3–5 giorni", "Valido 3 anni"],
  },
  {
    emoji: "🏦", title: "Conto Bancario Business", description: "Separa le finanze personali da quelle professionali.",
    chips: [
      { label: "Hype Business", url: "https://www.hype.it/business" },
      { label: "Revolut Business", url: "https://www.revolut.com/business" },
      { label: "N26", url: "https://n26.com/it-it/conto-business" },
    ],
    tips: ["Cerca zero canone", "Controlla i costi bonifici", "Preferisci IBAN italiano"],
  },
  {
    emoji: "📬", title: "PEC", description: "Obbligatoria per comunicazioni ufficiali con PA e fornitori.",
    cta: { label: "Attiva con Aruba →", url: "https://www.pec.it" },
    tips: ["Costa ~5€/anno", "Usala anche per contratti", "Conserva tutti i messaggi"],
  },
  {
    emoji: "🧾", title: "Fatturazione Elettronica", description: "Emetti fatture valide per l'Agenzia delle Entrate.",
    cta: { label: "Accedi a FatturaPA (gratuito) →", url: "https://ivaservizi.agenziaentrate.gov.it" },
    tips: ["Accedi con SPID", "Gratuita per forfettari", "Archivia in automatico"],
  },
  {
    emoji: "☁️", title: "Archivio Documenti", description: "Organizza contratti, preventivi e ricevute.",
    chips: [
      { label: "Google Drive", url: "https://drive.google.com" },
      { label: "Notion", url: "https://www.notion.so" },
    ],
    secondaryCta: { label: "Scarica i template Solvy →" },
    tips: ["Crea una cartella per ogni cliente", "Usa naming convention coerente", "Backup mensile obbligatorio"],
  },
  {
    emoji: "📧", title: "Email con Dominio", description: "La tua identità professionale: nome@tuodominio.it",
    chips: [
      { label: "Aruba", url: "https://www.aruba.it" },
      { label: "Google Workspace", url: "https://workspace.google.com" },
    ],
    tips: ["Un dominio .it costa ~10€/anno", "Usa il tuo nome professionale", "Configura firma HTML"],
  },
  {
    emoji: "📅", title: "Calendario Fiscale", description: "Scadenze IRPEF, INPS e F24 già precaricate.",
    cta: { label: "Aggiungi a Google Calendar →", url: "#" },
    tips: ["Imposta alert 7 e 30 giorni prima", "Sincronizza con il telefono", "Condividi col commercialista"],
  },
];

const STORAGE_KEY = "solvy-kit-statuses";

export default function KitPartenzaPage() {
  const [statuses, setStatuses] = useState<StepStatus[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || steps.map(() => "missing" as StepStatus); }
    catch { return steps.map(() => "missing" as StepStatus); }
  });
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses)); }, [statuses]);

  const doneCount = statuses.filter((s) => s === "done").length;

  const cycleStatus = (i: number) => {
    setStatuses((prev) => {
      const next = [...prev];
      const idx = statusCycle.indexOf(next[i]);
      next[i] = statusCycle[(idx + 1) % 3];
      return next;
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Kit di Partenza</h1>
        <p className="text-muted-foreground text-sm mt-1">Tutto ciò che ti serve per iniziare come freelancer.</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{doneCount} di {steps.length} step completati</span>
          <span className="font-medium text-foreground">{Math.round((doneCount / steps.length) * 100)}%</span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full gradient-accent rounded-full transition-all duration-500" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="rounded-xl bg-card border border-border/50 shadow-card overflow-hidden">
            <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
              <button onClick={(e) => { e.stopPropagation(); cycleStatus(i); }} className="text-xl shrink-0 w-8 h-8 flex items-center justify-center">
                {statusIcons[statuses[i]]}
              </button>
              <div className="relative flex-1 min-w-0">
                <span className="absolute -top-1 right-0 text-4xl font-bold text-muted/30 select-none">{i + 1}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{step.emoji}</span>
                  <h3 className="font-semibold text-foreground text-sm">{step.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
              </div>
              {expanded === i ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
            </div>

            {expanded === i && (
              <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border/50">
                {/* CTA / Chips */}
                <div className="flex flex-wrap gap-2 pt-3">
                  {step.cta && (
                    <a href={step.cta.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg gradient-accent text-foreground hover:opacity-90 transition-opacity">
                      <ExternalLink className="w-3.5 h-3.5" />{step.cta.label}
                    </a>
                  )}
                  {step.chips?.map((c) => (
                    <a key={c.label} href={c.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-colors">
                      {c.label} <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                  {step.secondaryCta && (
                    <button className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-colors">
                      <Download className="w-3.5 h-3.5" />{step.secondaryCta.label}
                    </button>
                  )}
                </div>

                {/* Tips */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Come fare →</p>
                  <ul className="space-y-1">
                    {step.tips.map((tip, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-accent-green-text mt-0.5">•</span>{tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
