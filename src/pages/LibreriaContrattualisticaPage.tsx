import { useState } from "react";
import {
  Scale, FileText, Shield, Users, Building2, Plus, Search,
  ExternalLink, Check, ChevronRight, FileSignature,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
type TemplateCategory = "sviluppo" | "marketing" | "legale" | "consulenza";
type ContactType = "cliente" | "fornitore" | "consulente";

type ContractTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  pages: number;
  tags: string[];
};

type Contact = {
  id: string;
  name: string;
  company: string;
  email: string;
  piva?: string;
  type: ContactType;
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const TEMPLATES: ContractTemplate[] = [
  {
    id: "sw-dev",
    name: "Contratto di Sviluppo Software",
    description:
      "Include clausole di cessione del codice sorgente, milestone, garanzie post-lancio, limitazioni di responsabilità e gestione bug.",
    category: "sviluppo",
    pages: 8,
    tags: ["Codice Sorgente", "Cessione IP", "Garanzie", "Bug Fix"],
  },
  {
    id: "smm",
    name: "Contratto Social Media Management",
    description:
      "Definisce responsabilità di gestione canali, KPI minimi garantiti, diritti sui contenuti creati e modalità di rendicontazione mensile.",
    category: "marketing",
    pages: 6,
    tags: ["Contenuti", "KPI", "Diritti d'uso", "Report"],
  },
  {
    id: "nda",
    name: "Accordo di Riservatezza (NDA)",
    description:
      "Template unilaterale e bilaterale per la protezione delle informazioni confidenziali condivise durante collaborazioni o trattative.",
    category: "legale",
    pages: 3,
    tags: ["Confidenzialità", "Bilaterale", "Segreto Aziendale"],
  },
  {
    id: "consulenza",
    name: "Contratto di Consulenza Generica",
    description:
      "Per prestazioni intellettuali continuative o a progetto. Include tariffe, scadenze di pagamento, disdetta e gestione extra-scope.",
    category: "consulenza",
    pages: 5,
    tags: ["Tariffa Oraria", "Extra-Scope", "Disdetta", "Fatturazione"],
  },
  {
    id: "design",
    name: "Contratto di Design & Branding",
    description:
      "Specifica proprietà dei file sorgente, numero di revisioni incluse, diritti d'uso del materiale e processo di approvazione finale.",
    category: "sviluppo",
    pages: 5,
    tags: ["File Sorgente", "Revisioni", "Licenza d'uso"],
  },
  {
    id: "incarico",
    name: "Lettera di Incarico",
    description:
      "Documento breve e immediato per formalizzare una collaborazione senza un contratto completo. Ideale per piccoli lavori e clienti di fiducia.",
    category: "consulenza",
    pages: 2,
    tags: ["Veloce", "Semplice", "Piccoli Lavori"],
  },
];

const CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Luca Ferretti",
    company: "Ferretti Design Studio",
    email: "luca@ferretti.it",
    piva: "IT01234567890",
    type: "cliente",
  },
  {
    id: "c2",
    name: "Studio Legale Rossi",
    company: "Rossi & Associati",
    email: "info@rossiassociati.it",
    piva: "IT09876543210",
    type: "cliente",
  },
  {
    id: "c3",
    name: "Marco Bianchi",
    company: "Startup Nexto",
    email: "marco@nexto.io",
    piva: "IT11223344556",
    type: "cliente",
  },
  {
    id: "c4",
    name: "Tipografia Gallo",
    company: "Gallo Print SRL",
    email: "ordini@galloprint.it",
    piva: "IT44556677889",
    type: "fornitore",
  },
  {
    id: "c5",
    name: "Elena Conti",
    company: "Freelance Copywriter",
    email: "elena@elenacopy.it",
    type: "consulente",
  },
  {
    id: "c6",
    name: "Francesco Moro",
    company: "Dev Solutions",
    email: "f.moro@devsol.it",
    type: "consulente",
  },
];

const CATEGORY_CONFIG: Record<TemplateCategory, { label: string; color: string }> = {
  sviluppo: { label: "Sviluppo", color: "bg-purple-500/15 text-purple-700" },
  marketing: { label: "Marketing", color: "bg-blue-500/15 text-blue-700" },
  legale: { label: "Legale", color: "bg-accent-orange/15 text-accent-orange-text" },
  consulenza: { label: "Consulenza", color: "bg-accent-green/15 text-accent-green-text" },
};

const CONTACT_TYPE_ICONS: Record<ContactType, React.ElementType> = {
  cliente: Users,
  fornitore: Building2,
  consulente: Scale,
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LibreriaContrattualisticaPage() {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<TemplateCategory | "">("");

  // Modal state
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [step, setStep] = useState<"assign" | "preview">("assign");

  // Contact assignment
  const [contactType, setContactType] = useState<ContactType | "">("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPiva, setNewPiva] = useState("");

  // ── Derived ──
  const filtered = TEMPLATES.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchCat = !filterCat || t.category === filterCat;
    return matchSearch && matchCat;
  });

  const visibleContacts = CONTACTS.filter((c) => !contactType || c.type === contactType);

  const selectedContact = CONTACTS.find((c) => c.id === selectedContactId);

  const canGenerate =
    !!contactType && ((isNew && !!newName) || !!selectedContactId);

  // ── Handlers ──
  const openTemplate = (t: ContractTemplate) => {
    setSelectedTemplate(t);
    setStep("assign");
    setContactType("");
    setSelectedContactId("");
    setIsNew(false);
    setNewName(""); setNewCompany(""); setNewEmail(""); setNewPiva("");
  };

  const handleGenerate = () => {
    if (!canGenerate) return;
    setStep("preview");
  };

  const handleSend = () => {
    const name = isNew ? newName : selectedContact?.name;
    toast.success(`Contratto pronto! Inviato a ${name} per firma elettronica 📄`);
    setSelectedTemplate(null);
  };

  const handleBack = () => {
    if (step === "preview") setStep("assign");
    else setSelectedTemplate(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Libreria Safe-Freelance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Template contrattuali revisionati da legali italiani specializzati nel digitale
          </p>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-green/8 border border-accent-green/20 shrink-0">
          <Shield className="w-4 h-4 text-accent-green-text shrink-0" />
          <p className="text-xs text-accent-green-text font-medium">Revisionati da avvocati italiani</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca template o tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["", "sviluppo", "marketing", "legale", "consulenza"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                filterCat === cat
                  ? "gradient-accent border-transparent text-foreground"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {cat === "" ? "Tutti" : CATEGORY_CONFIG[cat].label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Template Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template) => {
          const cat = CATEGORY_CONFIG[template.category];
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => openTemplate(template)}
              className="text-left p-5 rounded-xl border border-border bg-card shadow-card hover:shadow-card-hover hover:border-accent-green/40 transition-all group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5 text-foreground" />
                </div>
                <Badge className={cat.color}>{cat.label}</Badge>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-sm text-foreground leading-tight mb-1.5">
                {template.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                {template.description}
              </p>

              {/* Tags */}
              <div className="flex items-center gap-1 flex-wrap mb-3">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                <span>{template.pages} pagine</span>
                <span className="text-accent-green-text font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Usa template <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nessun template trovato per questa ricerca.</p>
          </div>
        )}
      </div>

      {/* ════════════════ Modal ════════════════ */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-accent-green-text" />
              {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>

          {step === "assign" ? (
            <div className="space-y-4 mt-1">
              <p className="text-sm text-muted-foreground">
                Seleziona il soggetto a cui assegnare il contratto. I dati verranno compilati
                automaticamente.
              </p>

              {/* Contact type tabs */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Tipo di controparte</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["cliente", "fornitore", "consulente"] as ContactType[]).map((type) => {
                    const Icon = CONTACT_TYPE_ICONS[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setContactType(type);
                          setSelectedContactId("");
                          setIsNew(false);
                        }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-colors capitalize ${
                          contactType === type
                            ? "border-accent-green bg-accent-green/10 text-accent-green-text"
                            : "border-border hover:bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact list */}
              {contactType && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Seleziona {contactType}
                  </p>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {visibleContacts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setSelectedContactId(c.id); setIsNew(false); }}
                        className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                          selectedContactId === c.id
                            ? "border-accent-green bg-accent-green/8"
                            : "border-border/50 hover:bg-secondary"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                          {c.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {c.company}{c.piva ? ` · ${c.piva}` : ""}
                          </p>
                        </div>
                        {selectedContactId === c.id && (
                          <Check className="w-4 h-4 text-accent-green-text shrink-0" />
                        )}
                      </button>
                    ))}

                    {/* New contact */}
                    <button
                      type="button"
                      onClick={() => { setIsNew(true); setSelectedContactId(""); }}
                      className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                        isNew
                          ? "border-accent-green bg-accent-green/8"
                          : "border-dashed border-border/50 hover:bg-secondary"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">
                        Nuovo contatto…
                      </span>
                      {isNew && <Check className="w-4 h-4 text-accent-green-text shrink-0 ml-auto" />}
                    </button>
                  </div>
                </div>
              )}

              {/* New contact form */}
              {isNew && (
                <div className="space-y-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <Input
                    placeholder="Nome e Cognome / Ragione Sociale *"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Input
                    placeholder="Azienda (opzionale)"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Input
                    placeholder="Email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Input
                    placeholder="P.IVA / Codice Fiscale"
                    value={newPiva}
                    onChange={(e) => setNewPiva(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              )}
            </div>
          ) : (
            /* ── Preview step ── */
            <div className="space-y-4 mt-1">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border/50 space-y-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-accent-green-text" />
                  <span className="text-sm font-semibold text-foreground">{selectedTemplate?.name}</span>
                </div>
                <InfoRow label="Assegnato a" value={isNew ? newName : selectedContact?.name || ""} />
                <InfoRow label="Azienda" value={isNew ? newCompany || "—" : selectedContact?.company || "—"} />
                <InfoRow label="Email" value={isNew ? newEmail || "—" : selectedContact?.email || "—"} />
                {(isNew ? newPiva : selectedContact?.piva) && (
                  <InfoRow label="P.IVA" value={isNew ? newPiva : selectedContact?.piva || "—"} />
                )}
                <InfoRow label="Tipo" value={contactType ? contactType.charAt(0).toUpperCase() + contactType.slice(1) : ""} />
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-green/8 border border-accent-green/20">
                <Shield className="w-4 h-4 text-accent-green-text shrink-0 mt-0.5" />
                <p className="text-xs text-accent-green-text leading-relaxed">
                  Il contratto verrà generato in PDF con i dati compilati automaticamente e potrà
                  essere inviato per la <strong>firma elettronica</strong> insieme al preventivo.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={handleBack}>
              {step === "preview" ? "Indietro" : "Annulla"}
            </Button>
            {step === "assign" ? (
              <Button
                onClick={handleGenerate}
                className="gradient-accent text-foreground font-semibold"
                disabled={!canGenerate}
              >
                Genera Contratto
              </Button>
            ) : (
              <Button onClick={handleSend} className="gradient-accent text-foreground font-semibold">
                <ExternalLink className="w-4 h-4 mr-2" /> Invia per Firma
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Micro component ──────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
