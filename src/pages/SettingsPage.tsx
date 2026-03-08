import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, FileText, Plus, Pencil, Trash2, X, Copy, Check, Palette } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Tables, Enums } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Client = Tables<"clients">;
type Supplier = Tables<"suppliers">;
type Tag = Tables<"tags">;
type ClientStatus = Enums<"client_status">;
type SupplierStatus = Enums<"supplier_status">;
type TagCategory = Enums<"tag_category">;

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
const tagCategoryLabels: Record<TagCategory, string> = {
  clienti: "Clienti", fornitori: "Collaboratori", progetti: "Progetti", stato: "Stato",
};
const tagColors = [
  "bg-emerald-500/20 text-emerald-700", "bg-blue-500/20 text-blue-700",
  "bg-orange-500/20 text-orange-700", "bg-violet-500/20 text-violet-700",
  "bg-rose-500/20 text-rose-700", "bg-cyan-500/20 text-cyan-700",
  "bg-lime-500/20 text-lime-700", "bg-fuchsia-500/20 text-fuchsia-700",
];

// ── Page ───────────────────────────────────────────────────────────────────────

const SettingsPage = () => {
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
          <TabsTrigger value="fornitori" className="text-xs sm:text-sm">Collaboratori</TabsTrigger>
          <TabsTrigger value="app" className="text-xs sm:text-sm">App</TabsTrigger>
        </TabsList>
        <TabsContent value="personali"><PersonalTab /></TabsContent>
        <TabsContent value="clienti"><ClientsTab /></TabsContent>
        <TabsContent value="fornitori"><SuppliersTab /></TabsContent>
        <TabsContent value="app"><AppTagsTab /></TabsContent>
      </Tabs>
    </div>
  );
};

// ── Personal Tab ───────────────────────────────────────────────────────────────

function PersonalTab() {
  const { profile, user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    nome: "", cognome: "", email: "", telefono: "",
    partita_iva: "", codice_fiscale: "", codice_ateco: "",
    coefficiente_redditivita: "", codice_sdi: "", indirizzo: "",
    notifica_scadenze_fiscali: true, notifica_push_pagamenti: true, report_settimanale: false,
    pdf_color_mode: "gradient" as string,
    pdf_color_start: "#AAFF45",
    pdf_color_end: "#FF6B1A",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        nome: profile.nome, cognome: profile.cognome, email: profile.email,
        telefono: profile.telefono, partita_iva: profile.partita_iva,
        codice_fiscale: profile.codice_fiscale, codice_ateco: profile.codice_ateco,
        coefficiente_redditivita: profile.coefficiente_redditivita,
        codice_sdi: profile.codice_sdi, indirizzo: profile.indirizzo,
        notifica_scadenze_fiscali: profile.notifica_scadenze_fiscali,
        notifica_push_pagamenti: profile.notifica_push_pagamenti,
        report_settimanale: profile.report_settimanale,
      });
    }
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("user_id", user.id);
    if (error) toast.error("Errore nel salvataggio");
    else {
      toast.success("Modifiche salvate");
      await refreshProfile();
    }
    setSaving(false);
  };

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-8 mt-6">
      <Section title="Informazioni profilo">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome" value={form.nome} onChange={v => update("nome", v)} />
          <Field label="Cognome" value={form.cognome} onChange={v => update("cognome", v)} />
          <Field label="Email" value={form.email} type="email" onChange={v => update("email", v)} />
          <Field label="Telefono" value={form.telefono} onChange={v => update("telefono", v)} />
        </div>
      </Section>

      <Section title="Fatturazione & P.IVA">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Partita IVA" value={form.partita_iva} onChange={v => update("partita_iva", v)} />
          <Field label="Codice Fiscale" value={form.codice_fiscale} onChange={v => update("codice_fiscale", v)} />
          <Field label="Codice ATECO" value={form.codice_ateco} onChange={v => update("codice_ateco", v)} />
          <Field label="Coefficiente di redditività" value={form.coefficiente_redditivita} onChange={v => update("coefficiente_redditivita", v)} />
          <Field label="Codice SDI" value={form.codice_sdi} onChange={v => update("codice_sdi", v)} />
          <Field label="Indirizzo" value={form.indirizzo} onChange={v => update("indirizzo", v)} />
        </div>
      </Section>

      <Section title="Collegamento Banca">
        <IntegrationRow icon={<Landmark className="w-4 h-4" />} name="Conto corrente bancario" description="Collega il tuo conto per monitorare entrate e uscite" connected={false} />
      </Section>

      <Section title="Fatturazione Elettronica">
        <div className="space-y-3">
          <IntegrationRow icon={<FileText className="w-4 h-4" />} name="Fiscozen" description="Gestione fiscale e dichiarazioni per forfettari" connected={false} />
          <IntegrationRow icon={<FileText className="w-4 h-4" />} name="Fatture in Cloud" description="Invio e ricezione fatture elettroniche" connected={false} />
        </div>
      </Section>

      <Section title="Notifiche">
        <div className="space-y-3">
          <ToggleRow label="Email per scadenze fiscali" checked={form.notifica_scadenze_fiscali} onChange={v => update("notifica_scadenze_fiscali", v)} />
          <ToggleRow label="Notifiche push per pagamenti" checked={form.notifica_push_pagamenti} onChange={v => update("notifica_push_pagamenti", v)} />
          <ToggleRow label="Report settimanale via email" checked={form.report_settimanale} onChange={v => update("report_settimanale", v)} />
        </div>
      </Section>

      <button
        onClick={save}
        disabled={saving}
        className="gradient-accent px-8 py-3 rounded-lg font-medium text-sm text-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? "Salvataggio..." : "Salva modifiche"}
      </button>
    </div>
  );
}

// ── Clients Tab ────────────────────────────────────────────────────────────────

function ClientsTab() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [editing, setEditing] = useState<Partial<Client> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("clients").select("*").eq("user_id", user.id).order("created_at");
    if (data) setClients(data);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing || !user) return;
    setSaving(true);
    if (isNew) {
      const { error } = await supabase.from("clients").insert({ ...editing, user_id: user.id } as any);
      if (error) { toast.error("Errore"); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("clients").update(editing as any).eq("id", editing.id!);
      if (error) { toast.error("Errore"); setSaving(false); return; }
    }
    toast.success(isNew ? "Cliente aggiunto" : "Cliente aggiornato");
    setEditing(null); setIsNew(false); setSaving(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("clients").delete().eq("id", id);
    toast.success("Cliente eliminato");
    load();
  };

  const copyValue = (value: string, key: string) => {
    navigator.clipboard.writeText(value); setCopiedField(key);
    toast.success("Copiato"); setTimeout(() => setCopiedField(null), 1500);
  };

  if (editing) {
    return (
      <ContactForm
        item={editing}
        type="client"
        saving={saving}
        onUpdate={(k, v) => setEditing(prev => prev ? { ...prev, [k]: v } : prev)}
        onSave={save}
        onCancel={() => { setEditing(null); setIsNew(false); }}
        isNew={isNew}
      />
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Lista Clienti</h2>
        <button onClick={() => { setEditing({ nome: "", email: "", telefono: "", partita_iva: "", codice_fiscale: "", codice_sdi: "", indirizzo: "", stato: "fase_conoscenza" as ClientStatus, progetti_attivi: 0 }); setIsNew(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent text-sm font-medium text-foreground hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Aggiungi
        </button>
      </div>
      {clients.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Nessun cliente ancora. Aggiungi il primo!</div>
      ) : (
        <div className="space-y-3">
          {clients.map(item => (
            <ContactCard key={item.id} item={item} type="client" copiedField={copiedField}
              onEdit={() => setEditing(item)} onDelete={() => remove(item.id)} onCopy={copyValue} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Suppliers Tab ──────────────────────────────────────────────────────────────

function SuppliersTab() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editing, setEditing] = useState<Partial<Supplier> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("suppliers").select("*").eq("user_id", user.id).order("created_at");
    if (data) setSuppliers(data);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing || !user) return;
    setSaving(true);
    if (isNew) {
      const { error } = await supabase.from("suppliers").insert({ ...editing, user_id: user.id } as any);
      if (error) { toast.error("Errore"); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("suppliers").update(editing as any).eq("id", editing.id!);
      if (error) { toast.error("Errore"); setSaving(false); return; }
    }
    toast.success(isNew ? "Collaboratore aggiunto" : "Collaboratore aggiornato");
    setEditing(null); setIsNew(false); setSaving(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("suppliers").delete().eq("id", id);
    toast.success("Collaboratore eliminato");
    load();
  };

  const copyValue = (value: string, key: string) => {
    navigator.clipboard.writeText(value); setCopiedField(key);
    toast.success("Copiato"); setTimeout(() => setCopiedField(null), 1500);
  };

  if (editing) {
    return (
      <ContactForm
        item={editing}
        type="supplier"
        saving={saving}
        onUpdate={(k, v) => setEditing(prev => prev ? { ...prev, [k]: v } : prev)}
        onSave={save}
        onCancel={() => { setEditing(null); setIsNew(false); }}
        isNew={isNew}
      />
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Lista Collaboratori</h2>
        <button onClick={() => { setEditing({ nome: "", email: "", telefono: "", partita_iva: "", codice_fiscale: "", codice_sdi: "", indirizzo: "", stato: "fase_conoscenza" as SupplierStatus }); setIsNew(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent text-sm font-medium text-foreground hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Aggiungi
        </button>
      </div>
      {suppliers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Nessun collaboratore ancora. Aggiungi il primo!</div>
      ) : (
        <div className="space-y-3">
          {suppliers.map(item => (
            <ContactCard key={item.id} item={item} type="supplier" copiedField={copiedField}
              onEdit={() => setEditing(item)} onDelete={() => remove(item.id)} onCopy={copyValue} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── App Tags Tab ───────────────────────────────────────────────────────────────

function AppTagsTab() {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editCategory, setEditCategory] = useState<TagCategory>("clienti");
  const [newTag, setNewTag] = useState("");
  const [newColor, setNewColor] = useState(tagColors[0]);
  const [addingInCategory, setAddingInCategory] = useState<TagCategory | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState<TagCategory | null>(null);
  const [categoryNames, setCategoryNames] = useState<Record<TagCategory, string>>({ ...tagCategoryLabels });
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("tags").select("*").eq("user_id", user.id).order("created_at");
    if (data) setTags(data);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const addTag = async (category: TagCategory) => {
    if (!newTag.trim() || !user) return;
    const colorIndex = tags.filter(t => t.category === category).length % tagColors.length;
    const { error } = await supabase.from("tags").insert({
      user_id: user.id, label: newTag.trim(), category, color: newColor || tagColors[colorIndex],
    });
    if (error) { toast.error("Errore"); return; }
    setNewTag(""); setAddingInCategory(null); setNewColor(tagColors[0]);
    toast.success("Tag creato");
    load();
  };

  const updateTag = async (id: string) => {
    if (!editLabel.trim()) return;
    const { error } = await supabase.from("tags").update({
      label: editLabel.trim(), color: editColor, category: editCategory,
    }).eq("id", id);
    if (error) { toast.error("Errore"); return; }
    setEditingTag(null);
    toast.success("Tag aggiornato");
    load();
  };

  const removeTag = async (id: string) => {
    await supabase.from("tags").delete().eq("id", id);
    toast.success("Tag rimosso");
    load();
  };

  const startEdit = (tag: Tag) => {
    setEditingTag(tag.id);
    setEditLabel(tag.label);
    setEditColor(tag.color);
    setEditCategory(tag.category);
  };

  const updateCategoryName = (cat: TagCategory, name: string) => {
    setCategoryNames(prev => ({ ...prev, [cat]: name }));
    setHasChanges(true);
  };

  const saveAll = async () => {
    setSaving(true);
    // Category names are local-only for now (stored in state)
    // Could persist to a user_settings table in the future
    toast.success("Modifiche salvate");
    setHasChanges(false);
    setSaving(false);
  };

  const categories: TagCategory[] = ["clienti", "fornitori", "progetti", "stato"];
  const categoryDots: Record<TagCategory, string> = {
    clienti: "bg-blue-500", fornitori: "bg-violet-500", progetti: "bg-orange-500", stato: "bg-emerald-500",
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground mb-1">Sistema Tag</h2>
          <p className="text-sm text-muted-foreground">
            Organizza i tuoi tag per categoria. Clicca su un tag per modificarlo, sul nome sezione per rinominarlo.
          </p>
        </div>
        <button
          onClick={saveAll}
          disabled={!hasChanges || saving}
          className="gradient-accent px-5 py-2 rounded-lg font-medium text-sm text-foreground hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
        >
          {saving ? "Salvataggio..." : "Salva"}
        </button>
      </div>

      {categories.map(cat => {
        const catTags = tags.filter(t => t.category === cat);
        return (
          <div key={cat} className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Category header */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${categoryDots[cat]}`} />
                {editingCategoryName === cat ? (
                  <input
                    type="text"
                    value={categoryNames[cat]}
                    onChange={e => updateCategoryName(cat, e.target.value)}
                    onBlur={() => setEditingCategoryName(null)}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditingCategoryName(null); }}
                    autoFocus
                    className="text-sm font-semibold bg-card border border-border rounded-md px-2 py-0.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 w-32"
                  />
                ) : (
                  <h3
                    className="text-sm font-semibold text-foreground cursor-pointer hover:text-muted-foreground transition-colors"
                    onClick={() => setEditingCategoryName(cat)}
                    title="Clicca per rinominare"
                  >
                    {categoryNames[cat]}
                  </h3>
                )}
                <span className="text-[11px] text-muted-foreground">({catTags.length})</span>
              </div>
              <button
                onClick={() => { setAddingInCategory(addingInCategory === cat ? null : cat); setNewTag(""); setNewColor(tagColors[catTags.length % tagColors.length]); }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Aggiungi
              </button>
            </div>

            {/* Tags list */}
            <div className="p-3">
              {catTags.length === 0 && addingInCategory !== cat && (
                <p className="text-xs text-muted-foreground text-center py-4">Nessun tag in questa categoria</p>
              )}

              <div className="flex flex-wrap gap-2">
                {catTags.map(tag => (
                  editingTag === tag.id ? (
                    <div key={tag.id} className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-ring/40 bg-secondary/50 w-full animate-fade-in">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={e => setEditLabel(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") updateTag(tag.id); if (e.key === "Escape") setEditingTag(null); }}
                        autoFocus
                        className="flex-1 min-w-[120px] px-2 py-1 text-sm bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                      />
                      <select
                        value={editCategory}
                        onChange={e => setEditCategory(e.target.value as TagCategory)}
                        className="px-2 py-1 text-xs bg-card border border-border rounded-md text-foreground focus:outline-none"
                      >
                        {categories.map(c => <option key={c} value={c}>{categoryNames[c]}</option>)}
                      </select>
                      <div className="flex gap-1">
                        {tagColors.map(c => (
                          <button key={c} onClick={() => setEditColor(c)}
                            className={`w-5 h-5 rounded-full border-2 transition-all ${c.split(" ")[0]} ${editColor === c ? "border-foreground scale-110" : "border-transparent opacity-50 hover:opacity-100"}`} />
                        ))}
                      </div>
                      <div className="flex gap-1 ml-auto">
                        <button onClick={() => updateTag(tag.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-accent-green-text hover:bg-accent-green/10 transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingTag(null)} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span key={tag.id}
                      className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all hover:shadow-md hover:scale-[1.03] ${tag.color}`}
                      onClick={() => startEdit(tag)}
                    >
                      {tag.label}
                      <button onClick={e => { e.stopPropagation(); removeTag(tag.id); }}
                        className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-foreground/10 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                ))}
              </div>

              {addingInCategory === cat && (
                <div className="flex flex-wrap items-center gap-2 mt-3 p-2 rounded-lg border border-dashed border-border bg-secondary/20 animate-fade-in">
                  <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addTag(cat); if (e.key === "Escape") setAddingInCategory(null); }}
                    placeholder="Nome del tag…" autoFocus
                    className="flex-1 min-w-[120px] px-2 py-1 text-sm bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  <div className="flex gap-1">
                    {tagColors.map(c => (
                      <button key={c} onClick={() => setNewColor(c)}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${c.split(" ")[0]} ${newColor === c ? "border-foreground scale-110" : "border-transparent opacity-50 hover:opacity-100"}`} />
                    ))}
                  </div>
                  <button onClick={() => addTag(cat)} disabled={!newTag.trim()}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-accent-green-text hover:bg-accent-green/10 transition-colors disabled:opacity-30">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setAddingInCategory(null)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Contact Card (shared) ──────────────────────────────────────────────────────

function ContactCard({ item, type, copiedField, onEdit, onDelete, onCopy }: {
  item: Client | Supplier;
  type: "client" | "supplier";
  copiedField: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: (value: string, key: string) => void;
}) {
  const statusLabels = type === "client" ? clientStatusLabels : supplierStatusLabels;
  const statusColors = type === "client" ? clientStatusColors : supplierStatusColors;

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground text-sm truncate">{item.nome || "Senza nome"}</h3>
          <p className="text-xs text-muted-foreground truncate">{item.email}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColors[item.stato as keyof typeof statusColors]}`}>
            {statusLabels[item.stato as keyof typeof statusLabels]}
            {type === "client" && item.stato === "progetti_attivi" && (item as Client).progetti_attivi
              ? ` (${(item as Client).progetti_attivi})` : ""}
          </span>
          <button onClick={onEdit} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
        {[
          { label: "Telefono", value: item.telefono },
          { label: "P.IVA", value: item.partita_iva },
          { label: "C.F.", value: item.codice_fiscale },
          { label: "SDI", value: item.codice_sdi },
          { label: "Indirizzo", value: item.indirizzo },
        ].map(f => (
          <div key={f.label} className="group flex items-start gap-1">
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{f.label}</p>
              <p className="text-xs text-foreground truncate">{f.value || "—"}</p>
            </div>
            {f.value && (
              <button onClick={() => onCopy(f.value, `${item.id}-${f.label}`)}
                className="mt-3 shrink-0 w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {copiedField === `${item.id}-${f.label}` ? <Check className="w-3 h-3 text-accent-green-text" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Contact Form (shared) ──────────────────────────────────────────────────────

function ContactForm({ item, type, saving, onUpdate, onSave, onCancel, isNew }: {
  item: Partial<Client | Supplier>;
  type: "client" | "supplier";
  saving: boolean;
  onUpdate: (key: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  const statusLabels = type === "client" ? clientStatusLabels : supplierStatusLabels;
  const statusOptions = Object.keys(statusLabels);

  return (
    <div className="mt-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          {isNew ? "Nuovo" : "Modifica"} {type === "client" ? "Cliente" : "Collaboratore"}
        </h2>
        <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome" value={(item as any).nome || ""} onChange={v => onUpdate("nome", v)} />
          <Field label="Email" value={(item as any).email || ""} type="email" onChange={v => onUpdate("email", v)} />
          <Field label="Telefono" value={(item as any).telefono || ""} onChange={v => onUpdate("telefono", v)} />
          <Field label="Partita IVA" value={(item as any).partita_iva || ""} onChange={v => onUpdate("partita_iva", v)} />
          <Field label="Codice Fiscale" value={(item as any).codice_fiscale || ""} onChange={v => onUpdate("codice_fiscale", v)} />
          <Field label="Codice SDI" value={(item as any).codice_sdi || ""} onChange={v => onUpdate("codice_sdi", v)} />
          <Field label="Indirizzo" value={(item as any).indirizzo || ""} className="sm:col-span-2" onChange={v => onUpdate("indirizzo", v)} />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Stato</label>
          <select value={(item as any).stato || statusOptions[0]} onChange={e => onUpdate("stato", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition">
            {statusOptions.map(s => <option key={s} value={s}>{statusLabels[s as keyof typeof statusLabels]}</option>)}
          </select>
        </div>
        {type === "client" && (item as any).stato === "progetti_attivi" && (
          <Field label="Numero progetti attivi" value={String((item as any).progetti_attivi || 0)} type="number"
            onChange={v => onUpdate("progetti_attivi", parseInt(v) || 0)} />
        )}
        <div className="flex gap-3 pt-2">
          <button onClick={onSave} disabled={saving}
            className="gradient-accent px-6 py-2.5 rounded-lg font-medium text-sm text-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? "Salvataggio..." : isNew ? "Aggiungi" : "Salva"}
          </button>
          <button onClick={onCancel} className="px-6 py-2.5 rounded-lg font-medium text-sm text-muted-foreground bg-secondary hover:bg-muted transition-colors">
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shared components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="text-base font-semibold text-foreground mb-4">{title}</h2>{children}</section>;
}

function Field({ label, value, type = "text", className = "", onChange }: {
  label: string; value: string; type?: string; className?: string; onChange?: (v: string) => void;
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
      <input type={type} value={value} onChange={onChange ? e => onChange(e.target.value) : undefined} readOnly={!onChange}
        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition" />
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
      <span className={`text-xs font-medium px-4 py-2 rounded-lg ${connected ? "bg-accent-green/10 text-accent-green-text" : "bg-secondary text-muted-foreground"}`}>
        {connected ? "Connesso" : "Presto disponibile"}
      </span>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-foreground">{label}</span>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-accent-green-text" : "bg-muted"}`}>
        <span className={`absolute top-0.5 left-0.5 bg-card rounded-full h-5 w-5 shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </label>
  );
}

export default SettingsPage;
