import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Plus, Search, Phone, Mail, MapPin, StickyNote, CalendarClock, Trash2, Edit2, ChevronDown, ChevronUp, FileText, Users, X, CalendarIcon
} from "lucide-react";

type ClientStatus = "fase_conoscenza" | "progetti_attivi" | "contatto_annuale" | "progetto_concluso";

interface Client {
  id: string;
  nome: string;
  email: string;
  telefono: string;
  indirizzo: string;
  partita_iva: string;
  codice_fiscale: string;
  codice_sdi: string;
  stato: ClientStatus;
  progetti_attivi: number;
  progetti_completati: number;
  note: string;
  reminder_at: string | null;
  created_at: string;
}

const statusConfig: Record<ClientStatus, { label: string; color: string }> = {
  fase_conoscenza: { label: "Primo contatto", color: "bg-[hsl(var(--accent-orange))]/15 text-[hsl(var(--accent-orange))]" },
  progetti_attivi: { label: "Progetto attivo", color: "bg-[hsl(var(--accent-green))]/15 text-[hsl(var(--accent-green-text))]" },
  contatto_annuale: { label: "Contatto ricorrente", color: "bg-[#1B4FDB]/15 text-[#1B4FDB]" },
  progetto_concluso: { label: "Progetto concluso", color: "bg-muted text-muted-foreground" },
};

const emptyClient = {
  nome: "", email: "", telefono: "", indirizzo: "", partita_iva: "",
  codice_fiscale: "", codice_sdi: "", stato: "fase_conoscenza" as ClientStatus,
  progetti_attivi: 0, progetti_completati: 0, note: "", reminder_at: null as string | null,
};

export default function LeadClientsPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyClient);
  const [reminderDate, setReminderDate] = useState<Date | undefined>();

  const userId = session?.user?.id;

  const fetchClients = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      setClients((data as Client[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, [userId]);

  const openNew = () => {
    setEditingClient(null);
    setForm(emptyClient);
    setReminderDate(undefined);
    setShowForm(true);
  };

  const openEdit = (c: Client) => {
    setEditingClient(c);
    setForm({
      nome: c.nome, email: c.email, telefono: c.telefono, indirizzo: c.indirizzo,
      partita_iva: c.partita_iva, codice_fiscale: c.codice_fiscale, codice_sdi: c.codice_sdi,
      stato: c.stato, progetti_attivi: c.progetti_attivi, progetti_completati: c.progetti_completati,
      note: c.note, reminder_at: c.reminder_at,
    });
    setReminderDate(c.reminder_at ? new Date(c.reminder_at) : undefined);
    setShowForm(true);
  };

  const saveClient = async () => {
    if (!userId || !form.nome.trim()) {
      toast({ title: "Inserisci almeno il nome", variant: "destructive" });
      return;
    }
    const payload = {
      ...form,
      reminder_at: reminderDate ? reminderDate.toISOString() : null,
      user_id: userId,
    };

    if (editingClient) {
      const { error } = await supabase.from("clients").update(payload).eq("id", editingClient.id);
      if (error) { toast({ title: "Errore", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Cliente aggiornato" });
    } else {
      const { error } = await supabase.from("clients").insert(payload);
      if (error) { toast({ title: "Errore", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Cliente aggiunto" });
    }
    setShowForm(false);
    fetchClients();
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) { toast({ title: "Errore", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Cliente eliminato" });
    fetchClients();
  };

  const filtered = clients.filter((c) => {
    const matchSearch = c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.stato === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: clients.length,
    attivi: clients.filter(c => c.stato === "progetti_attivi").length,
    conoscenza: clients.filter(c => c.stato === "fase_conoscenza").length,
    reminders: clients.filter(c => c.reminder_at && new Date(c.reminder_at) >= new Date()).length,
  };

  const hasUpcomingReminder = (r: string | null) => {
    if (!r) return false;
    const d = new Date(r);
    const now = new Date();
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-lg gradient-accent animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-28 md:pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground flex items-center gap-2">
            <Users className="w-7 h-7" /> Lead & Clienti
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tieni traccia dei tuoi contatti, progetti e follow-up
          </p>
        </div>
        <Button onClick={openNew} className="gradient-accent text-foreground gap-1.5 shrink-0">
          <Plus className="w-4 h-4" /> Nuovo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Totale", value: stats.total, icon: Users },
          { label: "Attivi", value: stats.attivi, icon: FileText },
          { label: "Primo contatto", value: stats.conoscenza, icon: StickyNote },
          { label: "Follow-up", value: stats.reminders, icon: CalendarClock },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <s.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome o email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "Tutti" },
            ...Object.entries(statusConfig).map(([k, v]) => ({ value: k, label: v.label })),
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                filterStatus === f.value
                  ? "gradient-accent text-foreground border-transparent"
                  : "border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Client List */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="p-8 text-center">
            <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              {clients.length === 0 ? "Nessun contatto ancora. Aggiungi il tuo primo lead!" : "Nessun risultato per i filtri selezionati."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => {
            const expanded = expandedId === client.id;
            const st = statusConfig[client.stato];
            const upcoming = hasUpcomingReminder(client.reminder_at);

            return (
              <Card
                key={client.id}
                className={cn("border-border transition-all", upcoming && "border-l-4 border-l-[hsl(var(--accent-orange))]")}
              >
                <CardContent className="p-4">
                  {/* Row header */}
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setExpandedId(expanded ? null : client.id)}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-foreground">
                        {client.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm truncate">{client.nome}</span>
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border-0", st.color)}>
                          {st.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {client.email || client.telefono || "Nessun contatto"}
                      </p>
                    </div>

                    {/* Reminder badge */}
                    {client.reminder_at && (
                      <div className={cn("hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                        upcoming ? "bg-[hsl(var(--accent-orange))]/15 text-[hsl(var(--accent-orange))]" : "bg-muted text-muted-foreground"
                      )}>
                        <CalendarClock className="w-3 h-3" />
                        {format(new Date(client.reminder_at), "d MMM", { locale: it })}
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(client); }}
                        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteClient(client.id); }}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      {/* Contacts */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {client.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4 shrink-0" /> <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.telefono && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4 shrink-0" /> {client.telefono}
                          </div>
                        )}
                        {client.indirizzo && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 shrink-0" /> {client.indirizzo}
                          </div>
                        )}
                        {client.partita_iva && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="w-4 h-4 shrink-0" /> P.IVA: {client.partita_iva}
                          </div>
                        )}
                      </div>

                      {/* Projects summary */}
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent-green))]" />
                          <span className="text-muted-foreground">{client.progetti_attivi} progett{client.progetti_attivi === 1 ? "o attivo" : "i attivi"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                          <span className="text-muted-foreground">{client.progetti_completati} completat{client.progetti_completati === 1 ? "o" : "i"}</span>
                        </div>
                      </div>

                      {/* Notes */}
                      {client.note && (
                        <div className="bg-secondary/50 rounded-lg p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <StickyNote className="w-3 h-3" /> Note
                          </p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{client.note}</p>
                        </div>
                      )}

                      {/* Reminder */}
                      {client.reminder_at && (
                        <div className={cn("rounded-lg p-3 flex items-center gap-2 text-sm",
                          upcoming ? "bg-[hsl(var(--accent-orange))]/10" : "bg-muted"
                        )}>
                          <CalendarClock className="w-4 h-4 shrink-0" />
                          <span>Follow-up: <strong>{format(new Date(client.reminder_at), "d MMMM yyyy", { locale: it })}</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Modifica contatto" : "Nuovo contatto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <Input placeholder="Indirizzo" value={form.indirizzo} onChange={(e) => setForm({ ...form, indirizzo: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="P.IVA" value={form.partita_iva} onChange={(e) => setForm({ ...form, partita_iva: e.target.value })} />
              <Input placeholder="Codice Fiscale" value={form.codice_fiscale} onChange={(e) => setForm({ ...form, codice_fiscale: e.target.value })} />
            </div>
            <Input placeholder="Codice SDI" value={form.codice_sdi} onChange={(e) => setForm({ ...form, codice_sdi: e.target.value })} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Stato</label>
                <Select value={form.stato} onValueChange={(v) => setForm({ ...form, stato: v as ClientStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Progetti attivi</label>
                <Input type="number" min={0} value={form.progetti_attivi} onChange={(e) => setForm({ ...form, progetti_attivi: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Progetti completati</label>
              <Input type="number" min={0} value={form.progetti_completati} onChange={(e) => setForm({ ...form, progetti_completati: parseInt(e.target.value) || 0 })} />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Note</label>
              <Textarea
                placeholder="Appunti sul cliente, primo contatto, preferenze…"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Reminder follow-up</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !reminderDate && "text-muted-foreground")}>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {reminderDate ? format(reminderDate, "d MMMM yyyy", { locale: it }) : "Seleziona data"}
                    {reminderDate && (
                      <X className="w-4 h-4 ml-auto" onClick={(e) => { e.stopPropagation(); setReminderDate(undefined); }} />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={reminderDate}
                    onSelect={setReminderDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={saveClient} className="w-full gradient-accent text-foreground">
              {editingClient ? "Salva modifiche" : "Aggiungi contatto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
