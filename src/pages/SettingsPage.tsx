import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, FileText, Plus, Pencil, Trash2, X, Copy, Check } from "lucide-react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────

type ClientStatus = "progetti_attivi" | "contatto_annuale" | "fase_conoscenza" | "progetto_concluso";
type SupplierStatus = "collaborazione_fissa" | "collaborazione_spot" | "fase_conoscenza" | "evitare";

interface Contact {
  id: string;
  nome: string;
  email: string;
  telefono: string;
  partitaIva: string;
  codiceFiscale: string;
  codiceSdi: string;
  indirizzo: string;
}

interface Client extends Contact {
  stato: ClientStatus;
  progettiAttivi?: number;
}

interface Supplier extends Contact {
  stato: SupplierStatus;
}

interface Tag {
  id: string;
  label: string;
  category: "clienti" | "fornitori" | "progetti" | "stato";
  color: string;
}

// ── Status maps ────────────────────────────────────────────────────────────────

const clientStatusLabels: Record<ClientStatus, string> = {
  progetti_attivi: "Progetti attivi",
  contatto_annuale: "Contatto annuale",
  fase_conoscenza: "Fase di conoscenza",
  progetto_concluso: "Progetto concluso",
};

const clientStatusColors: Record<ClientStatus, string> = {
  progetti_attivi: "bg-accent-green/15 text-accent-green-text",
  contatto_annuale: "bg-blue-100 text-blue-700",
  fase_conoscenza: "bg-amber-100 text-amber-700",
  progetto_concluso: "bg-muted text-muted-foreground",
};

const supplierStatusLabels: Record<SupplierStatus, string> = {
  collaborazione_fissa: "Collaborazione fissa",
  collaborazione_spot: "Collaborazione spot",
  fase_conoscenza: "In fase di conoscenza",
  evitare: "Evitare collaborazione",
};

const supplierStatusColors: Record<SupplierStatus, string> = {
  collaborazione_fissa: "bg-accent-green/15 text-accent-green-text",
  collaborazione_spot: "bg-blue-100 text-blue-700",
  fase_conoscenza: "bg-amber-100 text-amber-700",
  evitare: "bg-destructive/15 text-destructive",
};

const tagCategoryLabels: Record<Tag["category"], string> = {
  clienti: "Clienti",
  fornitori: "Fornitori",
  progetti: "Progetti",
  stato: "Stato",
};

const tagColors = [
  "bg-accent-green/15 text-accent-green-text",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
];

// ── Initial data ───────────────────────────────────────────────────────────────

const initialClients: Client[] = [
  {
    id: "c1", nome: "Luca Bianchi", email: "luca@azienda.it", telefono: "+39 02 1234567",
    partitaIva: "IT98765432100", codiceFiscale: "BNCLCU85M01F205Z", codiceSdi: "ABC1234",
    indirizzo: "Via Milano 10, Roma", stato: "progetti_attivi", progettiAttivi: 3,
  },
  {
    id: "c2", nome: "Sara Verdi", email: "sara@startup.io", telefono: "+39 06 7654321",
    partitaIva: "IT11223344556", codiceFiscale: "VRDSRA90D41H501Y", codiceSdi: "XYZ5678",
    indirizzo: "Corso Vittorio 22, Torino", stato: "contatto_annuale",
  },
];

const initialSuppliers: Supplier[] = [
  {
    id: "s1", nome: "Studio Pixel", email: "info@studiopixel.it", telefono: "+39 055 9876543",
    partitaIva: "IT55667788990", codiceFiscale: "PXLSTD80A01D612K", codiceSdi: "PXL0001",
    indirizzo: "Via dei Calzaiuoli 8, Firenze", stato: "collaborazione_fissa",
  },
];

const initialTags: Tag[] = [
  { id: "t1", label: "Premium", category: "clienti", color: tagColors[0] },
  { id: "t2", label: "Design", category: "fornitori", color: tagColors[3] },
  { id: "t3", label: "Web App", category: "progetti", color: tagColors[1] },
  { id: "t4", label: "In corso", category: "stato", color: tagColors[2] },
  { id: "t5", label: "Completato", category: "stato", color: tagColors[0] },
  { id: "t6", label: "Urgente", category: "progetti", color: tagColors[4] },
];

// ── Page ───────────────────────────────────────────────────────────────────────

const SettingsPage = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [tags, setTags] = useState<Tag[]>(initialTags);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Impostazioni</h1>
        <p className="text-muted-foreground text-sm mt-1">Configura il tuo account e le preferenze</p>
      </div>

      <Tabs defaultValue="personali" className="w-full">
        <TabsList className="w-full grid grid-cols-4 h-11">
          <TabsTrigger value="personali" className="text-xs sm:text-sm">Personali</TabsTrigger>
          <TabsTrigger value="clienti" className="text-xs sm:text-sm">Clienti</TabsTrigger>
          <TabsTrigger value="fornitori" className="text-xs sm:text-sm">Fornitori</TabsTrigger>
          <TabsTrigger value="app" className="text-xs sm:text-sm">App</TabsTrigger>
        </TabsList>

        <TabsContent value="personali"><PersonalTab /></TabsContent>
        <TabsContent value="clienti">
          <ContactTable
            type="client"
            items={clients}
            setItems={setClients as any}
            statusLabels={clientStatusLabels}
            statusColors={clientStatusColors}
            statusOptions={Object.keys(clientStatusLabels) as ClientStatus[]}
          />
        </TabsContent>
        <TabsContent value="fornitori">
          <ContactTable
            type="supplier"
            items={suppliers}
            setItems={setSuppliers as any}
            statusLabels={supplierStatusLabels}
            statusColors={supplierStatusColors}
            statusOptions={Object.keys(supplierStatusLabels) as SupplierStatus[]}
          />
        </TabsContent>
        <TabsContent value="app"><AppTagsTab tags={tags} setTags={setTags} /></TabsContent>
      </Tabs>
    </div>
  );
};

// ── Personal Tab ───────────────────────────────────────────────────────────────

function PersonalTab() {
  return (
    <div className="space-y-8 mt-6">
      <Section title="Informazioni profilo">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome" defaultValue="Marco" />
          <Field label="Cognome" defaultValue="Rossi" />
          <Field label="Email" defaultValue="marco@solvy.io" type="email" />
          <Field label="Telefono" defaultValue="+39 333 1234567" />
        </div>
      </Section>

      <Section title="Fatturazione & P.IVA">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Partita IVA" defaultValue="IT12345678901" />
          <Field label="Codice Fiscale" defaultValue="RSSMRC90A01H501Z" />
          <Field label="Codice ATECO" defaultValue="62.01.00" />
          <Field label="Coefficiente di redditività" defaultValue="67%" />
          <Field label="Codice SDI" defaultValue="3C984HL" />
          <Field label="Indirizzo" defaultValue="Via Roma 42, Milano" />
        </div>
      </Section>

      <Section title="Collegamento Banca">
        <IntegrationRow
          icon={<Landmark className="w-4 h-4" />}
          name="Conto corrente bancario"
          description="Collega il tuo conto per monitorare entrate e uscite"
          connected={false}
        />
      </Section>

      <Section title="Fatturazione Elettronica">
        <div className="space-y-3">
          <IntegrationRow
            icon={<FileText className="w-4 h-4" />}
            name="Fiscozen"
            description="Gestione fiscale e dichiarazioni per forfettari"
            connected={true}
          />
          <IntegrationRow
            icon={<FileText className="w-4 h-4" />}
            name="Fatture in Cloud"
            description="Invio e ricezione fatture elettroniche"
            connected={false}
          />
        </div>
      </Section>

      <Section title="Notifiche">
        <div className="space-y-3">
          <ToggleRow label="Email per scadenze fiscali" defaultChecked />
          <ToggleRow label="Notifiche push per pagamenti" defaultChecked />
          <ToggleRow label="Report settimanale via email" defaultChecked={false} />
        </div>
      </Section>

      <button className="gradient-accent px-8 py-3 rounded-lg font-medium text-sm text-foreground hover:opacity-90 transition-opacity">
        Salva modifiche
      </button>
    </div>
  );
}

// ── Contact Table (Clients & Suppliers) ────────────────────────────────────────

function ContactTable<T extends (Client | Supplier)>({
  type,
  items,
  setItems,
  statusLabels,
  statusColors,
  statusOptions,
}: {
  type: "client" | "supplier";
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
  statusOptions: string[];
}) {
  const [editing, setEditing] = useState<T | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const emptyContact = (): T => ({
    id: crypto.randomUUID(),
    nome: "", email: "", telefono: "", partitaIva: "",
    codiceFiscale: "", codiceSdi: "", indirizzo: "",
    stato: statusOptions[0],
    ...(type === "client" ? { progettiAttivi: 0 } : {}),
  } as T);

  const handleSave = (item: T) => {
    if (isNew) {
      setItems(prev => [...prev, item]);
    } else {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    }
    setEditing(null);
    setIsNew(false);
    toast.success(isNew ? "Aggiunto con successo" : "Modifiche salvate");
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Eliminato con successo");
  };

  const copyValue = (value: string, fieldKey: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(fieldKey);
    toast.success("Copiato");
    setTimeout(() => setCopiedField(null), 1500);
  };

  if (editing) {
    return (
      <ContactForm
        item={editing}
        type={type}
        statusLabels={statusLabels}
        statusOptions={statusOptions}
        onSave={handleSave}
        onCancel={() => { setEditing(null); setIsNew(false); }}
        isNew={isNew}
      />
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          {type === "client" ? "Lista Clienti" : "Lista Fornitori"}
        </h2>
        <button
          onClick={() => { setEditing(emptyContact()); setIsNew(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent text-sm font-medium text-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Aggiungi
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nessun {type === "client" ? "cliente" : "fornitore"} ancora. Aggiungi il primo!
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate">{item.nome}</h3>
                  <p className="text-xs text-muted-foreground truncate">{item.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColors[item.stato]}`}>
                    {statusLabels[item.stato]}
                    {type === "client" && item.stato === "progetti_attivi" && (item as Client).progettiAttivi
                      ? ` (${(item as Client).progettiAttivi})`
                      : ""}
                  </span>
                  <button
                    onClick={() => setEditing(item)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                {[
                  { label: "Telefono", value: item.telefono },
                  { label: "P.IVA", value: item.partitaIva },
                  { label: "C.F.", value: item.codiceFiscale },
                  { label: "SDI", value: item.codiceSdi },
                  { label: "Indirizzo", value: item.indirizzo },
                ].map(f => (
                  <div key={f.label} className="group flex items-start gap-1">
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{f.label}</p>
                      <p className="text-xs text-foreground truncate">{f.value || "—"}</p>
                    </div>
                    {f.value && (
                      <button
                        onClick={() => copyValue(f.value, `${item.id}-${f.label}`)}
                        className="mt-3 shrink-0 w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        {copiedField === `${item.id}-${f.label}` ? (
                          <Check className="w-3 h-3 text-accent-green-text" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Contact Form ───────────────────────────────────────────────────────────────

function ContactForm<T extends (Client | Supplier)>({
  item,
  type,
  statusLabels,
  statusOptions,
  onSave,
  onCancel,
  isNew,
}: {
  item: T;
  type: "client" | "supplier";
  statusLabels: Record<string, string>;
  statusOptions: string[];
  onSave: (item: T) => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState<T>({ ...item });

  const update = (key: keyof T, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="mt-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          {isNew ? "Nuovo" : "Modifica"} {type === "client" ? "Cliente" : "Fornitore"}
        </h2>
        <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome" defaultValue={form.nome} onChange={v => update("nome" as keyof T, v)} />
          <Field label="Email" defaultValue={form.email} type="email" onChange={v => update("email" as keyof T, v)} />
          <Field label="Telefono" defaultValue={form.telefono} onChange={v => update("telefono" as keyof T, v)} />
          <Field label="Partita IVA" defaultValue={form.partitaIva} onChange={v => update("partitaIva" as keyof T, v)} />
          <Field label="Codice Fiscale" defaultValue={form.codiceFiscale} onChange={v => update("codiceFiscale" as keyof T, v)} />
          <Field label="Codice SDI" defaultValue={form.codiceSdi} onChange={v => update("codiceSdi" as keyof T, v)} />
          <Field label="Indirizzo" defaultValue={form.indirizzo} className="sm:col-span-2" onChange={v => update("indirizzo" as keyof T, v)} />
        </div>

        {/* Status select */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Stato</label>
          <select
            value={form.stato}
            onChange={e => update("stato" as keyof T, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition"
          >
            {statusOptions.map(s => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
        </div>

        {/* Progetti attivi count for clients */}
        {type === "client" && form.stato === "progetti_attivi" && (
          <Field
            label="Numero progetti attivi"
            defaultValue={String((form as Client).progettiAttivi || 0)}
            type="number"
            onChange={v => update("progettiAttivi" as keyof T, parseInt(v) || 0)}
          />
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onSave(form)}
            className="gradient-accent px-6 py-2.5 rounded-lg font-medium text-sm text-foreground hover:opacity-90 transition-opacity"
          >
            {isNew ? "Aggiungi" : "Salva"}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg font-medium text-sm text-muted-foreground bg-secondary hover:bg-muted transition-colors"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App Tags Tab ───────────────────────────────────────────────────────────────

function AppTagsTab({ tags, setTags }: { tags: Tag[]; setTags: React.Dispatch<React.SetStateAction<Tag[]>> }) {
  const [newTag, setNewTag] = useState("");
  const [newCategory, setNewCategory] = useState<Tag["category"]>("clienti");

  const addTag = () => {
    if (!newTag.trim()) return;
    const colorIndex = tags.length % tagColors.length;
    setTags(prev => [...prev, {
      id: crypto.randomUUID(),
      label: newTag.trim(),
      category: newCategory,
      color: tagColors[colorIndex],
    }]);
    setNewTag("");
    toast.success("Tag aggiunto");
  };

  const removeTag = (id: string) => {
    setTags(prev => prev.filter(t => t.id !== id));
    toast.success("Tag rimosso");
  };

  const categories: Tag["category"][] = ["clienti", "fornitori", "progetti", "stato"];

  return (
    <div className="mt-6 space-y-6">
      <Section title="Gestione Tag">
        <p className="text-sm text-muted-foreground -mt-2 mb-4">
          Crea e gestisci i tag da usare per organizzare clienti, fornitori, progetti e stati.
        </p>

        {/* Add tag form */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTag()}
            placeholder="Nome del tag..."
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition"
          />
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value as Tag["category"])}
            className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition"
          >
            {categories.map(c => (
              <option key={c} value={c}>{tagCategoryLabels[c]}</option>
            ))}
          </select>
          <button
            onClick={addTag}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent text-sm font-medium text-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Aggiungi
          </button>
        </div>

        {/* Tags by category */}
        {categories.map(cat => {
          const catTags = tags.filter(t => t.category === cat);
          if (catTags.length === 0) return null;
          return (
            <div key={cat} className="mb-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {tagCategoryLabels[cat]}
              </h3>
              <div className="flex flex-wrap gap-2">
                {catTags.map(tag => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${tag.color}`}
                  >
                    {tag.label}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-foreground/10 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </Section>
    </div>
  );
}

// ── Shared components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label, defaultValue, type = "text", className = "", onChange,
}: {
  label: string; defaultValue: string; type?: string; className?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        onChange={onChange ? e => onChange(e.target.value) : undefined}
        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition"
      />
    </div>
  );
}

function IntegrationRow({ icon, name, description, connected }: {
  icon: React.ReactNode; name: string; description: string; connected: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">{icon}</div>
        <div>
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors ${
        connected ? "bg-accent-green/10 text-accent-green-text" : "bg-secondary text-muted-foreground hover:bg-muted"
      }`}>
        {connected ? "Connesso" : "Collega"}
      </button>
    </div>
  );
}

function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-foreground">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
      <div className="relative w-11 h-6 bg-muted peer-checked:bg-accent-green-text rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-card after:rounded-full after:h-5 after:w-5 after:shadow after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  );
}

export default SettingsPage;
