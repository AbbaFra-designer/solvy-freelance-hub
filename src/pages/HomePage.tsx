import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { usePreventivi } from "@/context/PreventiviContext";
import { StickyNote, Contact, Star, ArrowRight, FileText, UserCheck, Receipt, CalendarClock, Bot, Landmark, UsersRound, Rocket, Timer, Scale, LayoutGrid, Calendar, type LucideIcon } from "lucide-react";

// ─── Section registry ─────────────────────────────────────────────────────────
type SectionConfig = {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: LucideIcon;
  color: string;
};

export const ALL_SECTIONS: SectionConfig[] = [
  { id: "preventivi",         name: "Preventivi",               description: "Crea e gestisci preventivi professionali",        url: "/preventivi",          icon: FileText,       color: "bg-secondary text-foreground" },
  { id: "lead-clients",       name: "Lead & Clients",           description: "Pipeline clienti e gestione lead",                url: "/lead-clients",        icon: UserCheck,      color: "bg-secondary text-foreground" },
  { id: "prima-nota",         name: "Prima Nota",               description: "Registro entrate e uscite",                       url: "/prima-nota",          icon: Receipt,        color: "bg-[#7C4DFF]/10 text-[#7C4DFF]" },
  { id: "scadenzario",        name: "Scadenzario",              description: "Scadenze fiscali e pagamenti in arrivo",          url: "/scadenzario",         icon: CalendarClock,  color: "bg-accent-orange/10 text-accent-orange-text" },
  { id: "advisor",            name: "Advisor AI",               description: "Consulente AI per freelance",                     url: "/advisor",             icon: Bot,            color: "bg-[#1B4FDB]/10 text-[#1B4FDB]" },
  { id: "bandi",              name: "Bandi & Finanziamenti",    description: "Opportunità di finanziamento per freelance",      url: "/bandi",               icon: Landmark,       color: "bg-[#1B4FDB]/10 text-[#1B4FDB]" },
  { id: "professionisti",     name: "Professionisti",           description: "Commercialisti, avvocati e consulenti",           url: "/professionisti",      icon: UsersRound,     color: "bg-[#1A7A4A]/10 text-[#1A7A4A]" },
  { id: "kit-partenza",       name: "Kit Partenza",             description: "Strumenti e checklist per iniziare",              url: "/kit-partenza",        icon: Rocket,         color: "bg-accent-green/10 text-accent-green-text" },
  { id: "time-tracking",      name: "Time Tracking & ROI",      description: "Timer, ore per progetto e tariffa reale",         url: "/time-tracking",       icon: Timer,          color: "bg-accent-orange/10 text-accent-orange-text" },
  { id: "libreria-contratti", name: "Libreria Safe-Freelance",  description: "Template contrattuali revisionati da legali",     url: "/libreria-contratti",  icon: Scale,          color: "bg-accent-green/10 text-accent-green-text" },
  { id: "smm-planner",        name: "SMM Planner",              description: "Pianifica i tuoi contenuti social",               url: "/smm-planner",         icon: LayoutGrid,     color: "bg-purple-500/10 text-purple-700" },
  { id: "eventi-news",        name: "Eventi & News",            description: "Conferenze, webinar e novità del settore",        url: "/eventi-news",         icon: Calendar,       color: "bg-blue-500/10 text-blue-700" },
];

// ─── Widget data hooks ────────────────────────────────────────────────────────
function usePreventiviStats() {
  const { preventivi } = usePreventivi();
  const total = preventivi.length;
  const accettati = preventivi.filter((p) => p.stato === "accettato").length;
  const totaleValore = preventivi
    .filter((p) => p.stato === "accettato")
    .reduce((s, p) => s + p.voci.reduce((sv, v) => sv + v.quantita * v.prezzoUnitario, 0), 0);
  return { total, accettati, totaleValore };
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const displayName = profile?.nome || "utente";
  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long",
  });

  const favoriteSections = ALL_SECTIONS.filter((s) => favorites.includes(s.id));
  const notFavoriteSections = ALL_SECTIONS.filter((s) => !favorites.includes(s.id));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Ciao, {displayName} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1 capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate("/id-contact")}
            className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="ID Contact"
          >
            <Contact className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/email-bozzer")}
            className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Note"
          >
            <StickyNote className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Widget area ── */}
      {favoriteSections.length > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Le tue sezioni preferite</h2>
            <span className="text-xs text-muted-foreground">{favoriteSections.length} salvate</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteSections.map((section) => (
              <SectionWidget
                key={section.id}
                section={section}
                onNavigate={() => navigate(section.url)}
                onUnstar={() => toggleFavorite(section.id)}
              />
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="p-8 rounded-2xl border border-dashed border-border bg-card/50 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Nessuna sezione preferita</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Aggiungi una stellina ★ accanto a qualsiasi voce della sidebar per creare il tuo pannello personale.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── All sections grid ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          {favoriteSections.length > 0 ? "Tutte le sezioni" : "Esplora le sezioni — aggiungi le tue preferite"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {notFavoriteSections.map((section) => (
            <MiniSectionCard
              key={section.id}
              section={section}
              onNavigate={() => navigate(section.url)}
              onStar={() => toggleFavorite(section.id)}
            />
          ))}
          {favoriteSections.map((section) => (
            <MiniSectionCard
              key={section.id}
              section={section}
              starred
              onNavigate={() => navigate(section.url)}
              onStar={() => toggleFavorite(section.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Section Widget (large card for favorites) ────────────────────────────────
function SectionWidget({
  section,
  onNavigate,
  onUnstar,
}: {
  section: SectionConfig;
  onNavigate: () => void;
  onUnstar: () => void;
}) {
  const Icon = section.icon;

  // Preventivi has real data via context
  const prevStats = section.id === "preventivi" ? <PreventiviWidgetData /> : null;
  const timeStats = section.id === "time-tracking" ? <TimeWidgetData /> : null;
  const libStats = section.id === "libreria-contratti" ? <LibreriaWidgetData /> : null;

  return (
    <div className="group relative p-5 rounded-2xl border border-border bg-card shadow-card hover:shadow-card-hover transition-all">
      {/* Unstar button */}
      <button
        onClick={(e) => { e.stopPropagation(); onUnstar(); }}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-amber-400 opacity-0 group-hover:opacity-100 hover:bg-amber-400/10 transition-all"
        title="Rimuovi dai preferiti"
      >
        <Star className="w-4 h-4 fill-amber-400" />
      </button>

      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${section.color}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm text-foreground mb-1">{section.name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{section.description}</p>

      {/* Dynamic stats */}
      {prevStats}
      {timeStats}
      {libStats}

      {/* Navigate */}
      <button
        onClick={onNavigate}
        className="flex items-center gap-1 text-xs font-medium text-accent-green-text hover:gap-2 transition-all mt-auto pt-1"
      >
        Apri <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Preventivi real data widget ──────────────────────────────────────────────
function PreventiviWidgetData() {
  const { total, accettati, totaleValore } = usePreventiviStats();
  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <StatChip label="Totali" value={String(total)} />
      <StatChip label="Accettati" value={String(accettati)} accent />
      {totaleValore > 0 && (
        <div className="col-span-2">
          <StatChip label="Valore accettati" value={`€${totaleValore.toLocaleString("it-IT")}`} accent />
        </div>
      )}
    </div>
  );
}

function TimeWidgetData() {
  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <StatChip label="Progetti attivi" value="6" />
      <StatChip label="Ore tracciate" value="33h" accent />
    </div>
  );
}

function LibreriaWidgetData() {
  return (
    <div className="mb-4">
      <StatChip label="Template disponibili" value="6" accent />
    </div>
  );
}

function StatChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${accent ? "bg-accent-green/8 border border-accent-green/20" : "bg-secondary/60"}`}>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-base font-bold ${accent ? "text-accent-green-text" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

// ─── Mini card (grid of all sections) ────────────────────────────────────────
function MiniSectionCard({
  section,
  starred,
  onNavigate,
  onStar,
}: {
  section: SectionConfig;
  starred?: boolean;
  onNavigate: () => void;
  onStar: () => void;
}) {
  const Icon = section.icon;
  return (
    <div
      className="group relative p-4 rounded-xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all cursor-pointer"
      onClick={onNavigate}
    >
      {/* Star toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); onStar(); }}
        className={`absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
          starred
            ? "text-amber-400 opacity-100"
            : "text-muted-foreground/0 group-hover:text-muted-foreground/60 group-hover:opacity-100"
        } hover:bg-amber-400/10`}
        title={starred ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
      >
        <Star className={`w-3.5 h-3.5 ${starred ? "fill-amber-400" : ""}`} />
      </button>

      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform ${section.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xs font-medium text-foreground leading-tight">{section.name}</p>
    </div>
  );
}
