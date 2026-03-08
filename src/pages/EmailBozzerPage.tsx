import { ArrowLeft, Copy, Check, Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface EmailDraft {
  id: string;
  recipients: string;
  subject: string;
  body: string;
}

const defaultDrafts: EmailDraft[] = [
  {
    id: "1",
    recipients: "cliente@esempio.it, info@azienda.com",
    subject: "Preventivo progetto web",
    body: "Gentile Cliente,\n\nle invio in allegato il preventivo per il progetto discusso durante il nostro ultimo incontro.\n\nResto a disposizione per qualsiasi chiarimento.\n\nCordiali saluti,\nMarco Rossi",
  },
  {
    id: "2",
    recipients: "fornitore@esempio.it",
    subject: "Richiesta informazioni",
    body: "Buongiorno,\n\nvorrei ricevere maggiori informazioni riguardo ai vostri servizi.\n\nGrazie e buona giornata.",
  },
];

const EmailBozzerPage = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<EmailDraft[]>(defaultDrafts);
  const [editing, setEditing] = useState<EmailDraft | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyText = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success("Copiato negli appunti");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openNew = () =>
    setEditing({ id: crypto.randomUUID(), recipients: "", subject: "", body: "" });

  const openEdit = (draft: EmailDraft) => setEditing({ ...draft });

  const saveDraft = () => {
    if (!editing) return;
    if (!editing.subject.trim()) {
      toast.error("Inserisci un oggetto");
      return;
    }
    setDrafts((prev) => {
      const exists = prev.find((d) => d.id === editing.id);
      return exists
        ? prev.map((d) => (d.id === editing.id ? editing : d))
        : [...prev, editing];
    });
    setEditing(null);
    toast.success("Bozza salvata");
  };

  const deleteDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    toast.success("Bozza eliminata");
  };

  // ── Editor view ──
  if (editing) {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto space-y-6">
        <button
          onClick={() => setEditing(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors -mb-2"
        >
          <X className="w-4 h-4" />
          Annulla
        </button>

        <h1 className="text-2xl font-semibold text-foreground">
          {drafts.find((d) => d.id === editing.id) ? "Modifica bozza" : "Nuova bozza"}
        </h1>

        <div className="rounded-2xl border border-border bg-card shadow-card p-6 space-y-5">
          {/* Recipients */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Destinatari</label>
            <div className="flex items-start gap-2">
              <textarea
                value={editing.recipients}
                onChange={(e) => setEditing({ ...editing, recipients: e.target.value })}
                placeholder="email@esempio.it, altro@esempio.it"
                rows={2}
                className="flex-1 text-sm bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-green/40 resize-none"
              />
              <button
                onClick={() => copyText(editing.recipients, `edit-recipients`)}
                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors mt-0.5"
                title="Copia destinatari"
              >
                {copiedField === "edit-recipients" ? (
                  <Check className="w-4 h-4 text-accent-green-text" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Separa più indirizzi con una virgola. Le email non verranno inviate.
            </p>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Oggetto</label>
            <input
              value={editing.subject}
              onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
              placeholder="Oggetto dell'email"
              className="w-full text-sm bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-green/40"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-muted-foreground">Corpo email</label>
              <button
                onClick={() => copyText(editing.body, `edit-body`)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedField === "edit-body" ? (
                  <Check className="w-3.5 h-3.5 text-accent-green-text" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copia testo
              </button>
            </div>
            <textarea
              value={editing.body}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              placeholder="Scrivi il corpo dell'email…"
              rows={8}
              className="w-full text-sm bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-green/40 resize-y"
            />
          </div>

          <button
            onClick={saveDraft}
            className="w-full gradient-accent text-foreground font-medium text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
            Salva bozza
          </button>
        </div>
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto space-y-6">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors -mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Torna alla Home
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Email Bozzer</h1>
          <p className="text-muted-foreground text-sm mt-1">Le tue bozze email pronte da copiare</p>
        </div>
        <button
          onClick={openNew}
          className="w-10 h-10 rounded-xl gradient-accent text-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
          title="Nuova bozza"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {drafts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nessuna bozza. Creane una nuova!
        </div>
      )}

      <div className="space-y-3">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="rounded-2xl border border-border bg-card shadow-card hover:shadow-card-hover transition-shadow p-5 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(draft)}>
                <p className="text-xs text-muted-foreground truncate">{draft.recipients || "Nessun destinatario"}</p>
                <h3 className="font-semibold text-foreground text-sm mt-1 truncate">{draft.subject}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 whitespace-pre-line">
                  {draft.body}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyText(draft.body, `body-${draft.id}`)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Copia testo email"
                >
                  {copiedField === `body-${draft.id}` ? (
                    <Check className="w-4 h-4 text-accent-green-text" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(draft)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Modifica"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteDraft(draft.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Elimina"
                >
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
