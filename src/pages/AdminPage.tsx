import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Tables } from "@/integrations/supabase/types";
import { Users, Mail, Tag, Truck, ChevronDown, ChevronRight, Shield } from "lucide-react";

type Profile = Tables<"profiles">;
type Client = Tables<"clients">;
type Supplier = Tables<"suppliers">;
type TagRow = Tables<"tags">;
type EmailDraft = Tables<"email_drafts">;

interface UserData {
  profile: Profile;
  clients: Client[];
  suppliers: Supplier[];
  tags: TagRow[];
  drafts: EmailDraft[];
}

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);

    const [{ data: profiles }, { data: clients }, { data: suppliers }, { data: tags }, { data: drafts }] =
      await Promise.all([
        supabase.from("profiles").select("*").order("created_at"),
        supabase.from("clients").select("*").order("created_at"),
        supabase.from("suppliers").select("*").order("created_at"),
        supabase.from("tags").select("*").order("created_at"),
        supabase.from("email_drafts").select("*").order("updated_at", { ascending: false }),
      ]);

    const grouped = (profiles || []).map((p) => ({
      profile: p,
      clients: (clients || []).filter((c) => c.user_id === p.user_id),
      suppliers: (suppliers || []).filter((s) => s.user_id === p.user_id),
      tags: (tags || []).filter((t) => t.user_id === p.user_id),
      drafts: (drafts || []).filter((d) => d.user_id === p.user_id),
    }));

    setUsers(grouped);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-foreground">Accesso negato</h1>
        <p className="text-sm text-muted-foreground mt-2">Solo gli amministratori possono accedere a questa pagina.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
          <Shield className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">
            {loading ? "Caricamento..." : `${users.length} utenti registrati`}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Utenti" value={users.length} icon={<Users className="w-4 h-4" />} />
        <StatCard label="Clienti totali" value={users.reduce((s, u) => s + u.clients.length, 0)} icon={<Users className="w-4 h-4" />} />
        <StatCard label="Fornitori totali" value={users.reduce((s, u) => s + u.suppliers.length, 0)} icon={<Truck className="w-4 h-4" />} />
        <StatCard label="Bozze email" value={users.reduce((s, u) => s + u.drafts.length, 0)} icon={<Mail className="w-4 h-4" />} />
      </div>

      {/* User list */}
      <div className="space-y-3">
        {users.map((u) => {
          const isExpanded = expandedUser === u.profile.user_id;
          const displayName = `${u.profile.nome} ${u.profile.cognome}`.trim() || u.profile.email || "Senza nome";

          return (
            <div key={u.profile.user_id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setExpandedUser(isExpanded ? null : u.profile.user_id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-semibold text-muted-foreground">
                    {(u.profile.nome?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{u.clients.length} clienti</span>
                    <span>·</span>
                    <span>{u.suppliers.length} fornitori</span>
                    <span>·</span>
                    <span>{u.drafts.length} bozze</span>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-border p-4 sm:p-5 space-y-5">
                  {/* Profile */}
                  <DetailSection title="Profilo">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { l: "Telefono", v: u.profile.telefono },
                        { l: "P.IVA", v: u.profile.partita_iva },
                        { l: "C.F.", v: u.profile.codice_fiscale },
                        { l: "ATECO", v: u.profile.codice_ateco },
                        { l: "SDI", v: u.profile.codice_sdi },
                        { l: "Indirizzo", v: u.profile.indirizzo },
                        { l: "Attività", v: u.profile.tipo_attivita },
                        { l: "Registrato", v: new Date(u.profile.created_at).toLocaleDateString("it-IT") },
                      ].map(f => (
                        <div key={f.l}>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{f.l}</p>
                          <p className="text-xs text-foreground">{f.v || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </DetailSection>

                  {/* Clients */}
                  {u.clients.length > 0 && (
                    <DetailSection title={`Clienti (${u.clients.length})`}>
                      <div className="space-y-2">
                        {u.clients.map(c => (
                          <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                            <div>
                              <p className="text-xs font-medium text-foreground">{c.nome || "—"}</p>
                              <p className="text-[11px] text-muted-foreground">{c.email}</p>
                            </div>
                            <StatusBadge status={c.stato} />
                          </div>
                        ))}
                      </div>
                    </DetailSection>
                  )}

                  {/* Suppliers */}
                  {u.suppliers.length > 0 && (
                    <DetailSection title={`Fornitori (${u.suppliers.length})`}>
                      <div className="space-y-2">
                        {u.suppliers.map(s => (
                          <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                            <div>
                              <p className="text-xs font-medium text-foreground">{s.nome || "—"}</p>
                              <p className="text-[11px] text-muted-foreground">{s.email}</p>
                            </div>
                            <StatusBadge status={s.stato} />
                          </div>
                        ))}
                      </div>
                    </DetailSection>
                  )}

                  {/* Tags */}
                  {u.tags.length > 0 && (
                    <DetailSection title={`Tag (${u.tags.length})`}>
                      <div className="flex flex-wrap gap-1.5">
                        {u.tags.map(t => (
                          <span key={t.id} className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${t.color}`}>
                            {t.label}
                          </span>
                        ))}
                      </div>
                    </DetailSection>
                  )}

                  {/* Drafts */}
                  {u.drafts.length > 0 && (
                    <DetailSection title={`Bozze Email (${u.drafts.length})`}>
                      <div className="space-y-2">
                        {u.drafts.map(d => (
                          <div key={d.id} className="py-1.5 border-b border-border last:border-0">
                            <p className="text-xs font-medium text-foreground">{d.subject || "Senza oggetto"}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{d.recipients || "Nessun destinatario"}</p>
                          </div>
                        ))}
                      </div>
                    </DetailSection>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-card shadow-card border border-border/50">
      <div className="flex items-center gap-2 text-muted-foreground mb-1.5">{icon}<span className="text-xs">{label}</span></div>
      <p className="text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    progetti_attivi: "bg-accent-green/15 text-accent-green-text",
    contatto_annuale: "bg-blue-100 text-blue-700",
    fase_conoscenza: "bg-amber-100 text-amber-700",
    progetto_concluso: "bg-muted text-muted-foreground",
    collaborazione_fissa: "bg-accent-green/15 text-accent-green-text",
    collaborazione_spot: "bg-blue-100 text-blue-700",
    evitare: "bg-destructive/15 text-destructive",
  };
  const label = status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorMap[status] || "bg-muted text-muted-foreground"}`}>
      {label}
    </span>
  );
}

export default AdminPage;
