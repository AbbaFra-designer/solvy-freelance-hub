import { ArrowLeft, Copy, Check, Plus, Pencil, Trash2, X, Save, CalendarIcon, Tag } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Tables } from "@/integrations/supabase/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type EmailDraft = Tables<"email_drafts">;
type TagRow = Tables<"tags">;

const EmailBozzerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [tags, setTags] = useState<TagRow[]>([]);
  const [editing, setEditing] = useState<Partial<EmailDraft> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("email_drafts").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
    if (data) setDrafts(data);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const copyText = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success("Copiato negli appunti");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openNew = () => {
    setEditing({ recipients: "", subject: "", body: "", reminder_at: null });
    setIsNew(true);
  };

  const openEdit = (draft: EmailDraft) => {
    setEditing({ ...draft });
    setIsNew(false);
  };

  const saveDraft = async () => {
    if (!editing || !user) return;
    if (!editing.subject?.trim()) {
      toast.error("Inserisci un oggetto");
      return;
    }
    setSaving(true);
    if (isNew) {
      const { error } = await supabase.from("email_drafts").insert({
        user_id: user.id,
        recipients: editing.recipients || "",
        subject: editing.subject || "",
        body: editing.body || "",
        reminder_at: editing.reminder_at || null,
      });
      if (error) { toast.error("Errore"); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("email_drafts").update({
        recipients: editing.recipients,
        subject: editing.subject,
        body: editing.body,
        reminder_at: editing.reminder_at || null,
      }).eq("id", editing.id!);
      if (error) { toast.error("Errore"); setSaving(false); return; }
    }
    toast.success("Bozza salvata");
    setEditing(null); setIsNew(false); setSaving(false);
    load();
  };

  const deleteDraft = async (id: string) => {
    await supabase.from("email_drafts").delete().eq("id", id);
    toast.success("Bozza eliminata");
    load();
  };

  // ── Editor view ──
  if (editing) {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto space-y-6">
        <button onClick={() => { setEditing(null); setIsNew(false); }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors -mb-2">
          <X className="w-4 h-4" /> Annulla
        </button>

        <h1 className="text-2xl font-semibold text-foreground">
          {isNew ? "Nuova bozza" : "Modifica bozza"}
        </h1>

        <div className="rounded-2xl border border-border bg-card shadow-card p-6 space-y-5">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Destinatari</label>
            <div className="flex items-start gap-2">
              <textarea value={editing.recipients || ""} onChange={e => setEditing({ ...editing, recipients: e.target.value })}
                placeholder="email@esempio.it, altro@esempio.it" rows={2}
                className="flex-1 text-sm bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-green/40 resize-none" />
              <button onClick={() => copyText(editing.recipients || "", "edit-recipients")}
                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors mt-0.5" title="Copia destinatari">
                {copiedField === "edit-recipients" ? <Check className="w-4 h-4 text-accent-green-text" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Separa più indirizzi con una virgola. Le email non verranno inviate.</p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Oggetto</label>
            <input value={editing.subject || ""} onChange={e => setEditing({ ...editing, subject: e.target.value })}
              placeholder="Oggetto dell'email"
              className="w-full text-sm bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-green/40" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Promemoria</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-2 text-sm bg-secondary/50 border border-border rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary/70",
                    editing.reminder_at ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="w-4 h-4 shrink-0" />
                  {editing.reminder_at
                    ? format(new Date(editing.reminder_at), "d MMMM yyyy", { locale: it })
                    : "Imposta un promemoria…"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={editing.reminder_at ? new Date(editing.reminder_at) : undefined}
                  onSelect={(date) => setEditing({ ...editing, reminder_at: date ? date.toISOString() : null })}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  locale={it}
                />
              </PopoverContent>
            </Popover>
            {editing.reminder_at && (
              <button onClick={() => setEditing({ ...editing, reminder_at: null })}
                className="text-[11px] text-muted-foreground hover:text-destructive mt-1 transition-colors">
                Rimuovi promemoria
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-muted-foreground">Corpo email</label>
              <button onClick={() => copyText(editing.body || "", "edit-body")}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {copiedField === "edit-body" ? <Check className="w-3.5 h-3.5 text-accent-green-text" /> : <Copy className="w-3.5 h-3.5" />}
                Copia testo
              </button>
            </div>
            <textarea value={editing.body || ""} onChange={e => setEditing({ ...editing, body: e.target.value })}
              placeholder="Scrivi il corpo dell'email…" rows={8}
              className="w-full text-sm bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-green/40 resize-y" />
          </div>

          <button onClick={saveDraft} disabled={saving}
            className="w-full gradient-accent text-foreground font-medium text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Salvataggio..." : "Salva bozza"}
          </button>
        </div>
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto space-y-6">
      <button onClick={() => navigate("/")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors -mb-2">
        <ArrowLeft className="w-4 h-4" /> Torna alla Home
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Email Bozzer</h1>
          <p className="text-muted-foreground text-sm mt-1">Le tue bozze email pronte da copiare</p>
        </div>
        <button onClick={openNew}
          className="w-10 h-10 rounded-xl gradient-accent text-foreground flex items-center justify-center hover:opacity-90 transition-opacity" title="Nuova bozza">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {drafts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">Nessuna bozza. Creane una nuova!</div>
      )}

      <div className="space-y-3">
        {drafts.map(draft => (
          <div key={draft.id} className="rounded-2xl border border-border bg-card shadow-card hover:shadow-card-hover transition-shadow p-5 group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(draft)}>
                <p className="text-xs text-muted-foreground truncate">{draft.recipients || "Nessun destinatario"}</p>
                <h3 className="font-semibold text-foreground text-sm mt-1 truncate">{draft.subject}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 whitespace-pre-line">{draft.body}</p>
                {draft.reminder_at && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-orange-text bg-accent-orange/10 px-2 py-0.5 rounded-full mt-2">
                    <CalendarIcon className="w-3 h-3" />
                    {format(new Date(draft.reminder_at), "d MMM yyyy", { locale: it })}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button onClick={() => copyText(draft.body, `body-${draft.id}`)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Copia testo email">
                  {copiedField === `body-${draft.id}` ? <Check className="w-4 h-4 text-accent-green-text" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(draft)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Modifica">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteDraft(draft.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Elimina">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailBozzerPage;
