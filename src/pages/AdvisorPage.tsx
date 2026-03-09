import { useState } from "react";
import { MessageCircle, AlertTriangle } from "lucide-react";
import AdvisorChatModal from "@/components/advisor/AdvisorChatModal";

const advisors = [
  {
    name: "Fiscola",
    role: "Commercialista AI",
    accent: "#1B4FDB",
    initials: "FI",
    description: "Regime forfettario, scadenze fiscali, soglie IVA. Risposte precise aggiornate al 2026.",
    mockMessages: [
      { role: "bot" as const, text: "Ciao! Sono Fiscola, il tuo commercialista AI. Come posso aiutarti oggi?" },
      { role: "user" as const, text: "Qual è il limite di fatturato per il regime forfettario nel 2026?" },
      { role: "bot" as const, text: "Nel 2026, il limite di ricavi per il regime forfettario è confermato a €85.000 annui. Superando questa soglia, dal periodo d'imposta successivo si passa al regime ordinario. Ricorda: se superi €100.000 in corso d'anno, il passaggio è immediato." },
    ],
  },
  {
    name: "Lex",
    role: "Avvocato AI",
    accent: "#1A7A4A",
    initials: "LX",
    description: "Contratti freelance, GDPR, AI Act. Tutela legale in linguaggio accessibile.",
    mockMessages: [
      { role: "bot" as const, text: "Benvenuto! Sono Lex, il tuo assistente legale AI. In cosa posso orientarti?" },
      { role: "user" as const, text: "Devo aggiornare la privacy policy per l'AI Act?" },
      { role: "bot" as const, text: "Sì, dal 2025 l'AI Act richiede trasparenza sull'uso di sistemi AI. Se usi strumenti di AI nel tuo lavoro, devi informare i clienti nella tua privacy policy e nei termini di servizio. Ti consiglio di aggiungere una sezione dedicata." },
    ],
  },
  {
    name: "Mira",
    role: "Marketer AI",
    accent: "#FF6B4A",
    initials: "MI",
    description: "Brand identity, LinkedIn, pricing psicologico. Strategie per farti notare.",
    mockMessages: [
      { role: "bot" as const, text: "Hey! Sono Mira 🎯 Parliamo di come far crescere il tuo brand da freelancer?" },
      { role: "user" as const, text: "Come dovrei impostare i prezzi per i miei servizi?" },
      { role: "bot" as const, text: "Il pricing psicologico è fondamentale! Ti consiglio 3 pacchetti (base, pro, premium) con il pro evidenziato come 'più scelto'. Usa prezzi che finiscono in 7 (es. €497 anziché €500). E ricorda: il tuo prezzo comunica il tuo valore." },
    ],
  },
  {
    name: "Flow",
    role: "Coach AI",
    accent: "#7C4DFF",
    initials: "FL",
    description: "Mindset, produttività, gestione del rifiuto. Il tuo spazio per crescere.",
    mockMessages: [
      { role: "bot" as const, text: "Ciao, sono Flow 🧘 Sono qui per aiutarti a trovare il tuo ritmo da freelancer." },
      { role: "user" as const, text: "Come gestisco l'ansia di non avere lavoro fisso?" },
      { role: "bot" as const, text: "È una delle sfide più comuni per i freelancer. Ti suggerisco la regola del 3-3-3: dedica ogni giorno 3 ore al lavoro attuale, 3 al networking/acquisizione clienti, e 3 alla crescita personale. Avere una routine riduce l'incertezza percepita." },
    ],
  },
];

export default function AdvisorPage() {
  const [openChat, setOpenChat] = useState<number | null>(null);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">I tuoi Advisor AI</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Quattro esperti virtuali sempre disponibili, aggiornati alle normative 2026.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {advisors.map((a, i) => (
          <div key={a.name} className="p-5 rounded-xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: a.accent }}
              >
                {a.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground">{a.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{a.role}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{a.description}</p>
                <button
                  onClick={() => setOpenChat(i)}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg gradient-accent text-foreground hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chatta ora →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="flex gap-3 p-4 rounded-xl bg-accent-orange/5 border-l-4 border-accent-orange">
        <AlertTriangle className="w-5 h-5 text-accent-orange-text shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Questi chatbot forniscono orientamento generale e non sostituiscono la consulenza professionale. Uso dell'AI dichiarato ai sensi della Legge 132/2025.
        </p>
      </div>

      {openChat !== null && (
        <AdvisorChatModal advisor={advisors[openChat]} open onClose={() => setOpenChat(null)} />
      )}
    </div>
  );
}
