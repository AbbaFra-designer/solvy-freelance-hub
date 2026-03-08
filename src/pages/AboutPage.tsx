import { ArrowLeft, Sparkles, Zap, Crown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const freeApps = [
  { name: "ID Contact", desc: "I tuoi dati aziendali sempre a portata di mano" },
  { name: "Email Bozze", desc: "Template email pronti da personalizzare" },
];

const premiumApps = [
  { name: "Preventivi", desc: "Crea e gestisci preventivi professionali" },
  { name: "Lead & Clients", desc: "Gestisci lead e converti in clienti" },
  { name: "Eventi e News", desc: "Resta aggiornato su eventi e opportunità" },
  { name: "Bandi", desc: "Scopri bandi e finanziamenti" },
  { name: "SMM Planner", desc: "Pianifica i tuoi contenuti social" },
];

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-10 pb-28">
      {/* Back */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Torna alla Home
      </button>

      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto shadow-lg">
          <span className="text-2xl font-black text-foreground">S</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Solvy
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          La dashboard che ti aiuta nelle tue attività quotidiane.
          <br />
          <span className="text-foreground font-medium">Zero tempo perso, tutto sotto controllo.</span>
        </p>
      </div>

      {/* Per chi è */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent-orange" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Per chi è Solvy?</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Per <span className="text-foreground font-medium">freelancer che non hanno tempo da perdere</span>. 
          Partita IVA forfettaria, mille cose da gestire e poco tempo per farlo. 
          Solvy mette tutto in un unico posto: dati fiscali, preventivi, email, tasse e molto altro.
        </p>
      </section>

      {/* Pricing */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Quanto costa?</h2>

        {/* Free tier */}
        <div className="rounded-2xl border border-accent-green/30 bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Free</h3>
              <p className="text-xs text-muted-foreground">Gratis, per sempre</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {freeApps.map((app) => (
              <li key={app.name} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-accent-green-text mt-0.5 shrink-0" />
                <div>
                  <span className="text-sm font-medium text-foreground">{app.name}</span>
                  <p className="text-xs text-muted-foreground">{app.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Premium tier */}
        <div className="rounded-2xl border border-accent-orange/30 bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-accent-orange" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">App Premium</h3>
              <p className="text-xs text-muted-foreground">3,99 €/mese per ogni app</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {premiumApps.map((app) => (
              <li key={app.name} className="flex items-start gap-2.5">
                <Crown className="w-4 h-4 text-accent-orange mt-0.5 shrink-0" />
                <div>
                  <span className="text-sm font-medium text-foreground">{app.name}</span>
                  <p className="text-xs text-muted-foreground">{app.desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            Attiva solo le app che ti servono, paga solo per quelle che usi.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
