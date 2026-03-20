import { TrendingUp, Percent, Package, Bell, Mail, StickyNote, Contact } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApps } from "@/context/AppsContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useCallback } from "react";
import { format, isToday, isTomorrow, isPast, isFuture, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";

const HomePage = () => {
  const { apps } = useApps();
  const { profile, user } = useAuth();
  const activeApps = apps.filter((a) => a.active);
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<any[]>([]);

  const displayName = profile?.nome || "utente";
  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const loadReminders = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("email_drafts")
      .select("*")
      .eq("user_id", user.id)
      .not("reminder_at", "is", null)
      .order("reminder_at", { ascending: true });
    if (data) setReminders(data);
  }, [user]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const getReminderLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return { text: "Oggi", className: "bg-destructive/15 text-destructive" };
    if (isTomorrow(date)) return { text: "Domani", className: "bg-accent-orange/15 text-accent-orange-text" };
    if (isPast(date)) return { text: "Scaduto", className: "bg-destructive/15 text-destructive" };
    const days = differenceInDays(date, new Date());
    if (days <= 7) return { text: `Tra ${days}g`, className: "bg-accent-orange/15 text-accent-orange-text" };
    return { text: format(date, "d MMM", { locale: it }), className: "bg-secondary text-muted-foreground" };
  };

  const upcomingReminders = reminders.filter(r => {
    const date = new Date(r.reminder_at);
    return isToday(date) || isFuture(date) || (isPast(date) && differenceInDays(new Date(), date) <= 7);
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Ciao, {displayName} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1 capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate("/id-contact")}
            className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="ID Contact"
            aria-label="Apri ID Contact"
          >
            <Contact className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/email-bozzer")}
            className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Notes"
            aria-label="Apri Notes"
          >
            <StickyNote className="w-4 h-4" />
          </button>
        </div>
      </div>

      {(() => {
        const fatturato = 40500;
        const coeff = profile?.coefficiente_redditivita ? parseFloat(profile.coefficiente_redditivita) : 0;
        const codiceAteco = profile?.codice_ateco || "—";
        const aliquotaForfettario = 15; // aliquota sostitutiva standard
        const redditoImponibile = fatturato * (coeff / 100);
        const tasse = Math.round(redditoImponibile * (aliquotaForfettario / 100));
        const taxLabel = coeff > 0
          ? `${coeff}% coeff. × ${aliquotaForfettario}% imposta · ATECO ${codiceAteco}`
          : "Imposta il coefficiente nei Settings";

        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard title="Fatturato del mese" value={`€ ${fatturato.toLocaleString("it-IT")}`} subtitle="+12% vs mese scorso" icon={<TrendingUp className="w-5 h-5" />} variant="default" />
            <KpiCard title="Tasse da accantonare" value={coeff > 0 ? `€ ${tasse.toLocaleString("it-IT")}` : "—"} subtitle={taxLabel} icon={<Percent className="w-5 h-5" />} variant="orange" />
            <KpiCard title="Pacchetti attivi" value={String(activeApps.length)} subtitle={`su ${apps.length} disponibili`} icon={<Package className="w-5 h-5" />} variant="green" />
          </div>
        );
      })()}

      {/* ── Promemoria ── */}
      {upcomingReminders.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent-orange/10 text-accent-orange-text flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Promemoria</h2>
            <span className="ml-auto text-xs text-muted-foreground">{upcomingReminders.length} attivi</span>
          </div>
          <div className="space-y-2">
            {upcomingReminders.map((r) => {
              const label = getReminderLabel(r.reminder_at);
              return (
                <div key={r.id} onClick={() => navigate("/email-bozzer")} className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-accent-orange-text" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.subject || "Senza oggetto"}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.recipients || "Nessun destinatario"}</p>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${label.className}`}>
                    {label.text}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Le tue App ── Solo app attive ── */}
      {activeApps.length > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Le tue App</h2>
            <button
              onClick={() => navigate("/apps")}
              className="text-xs text-accent-orange-text hover:underline"
            >
              Gestisci →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {activeApps.map((app) => (
              <div
                key={app.id}
                onClick={() => app.url && navigate(app.url)}
                className={`p-4 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all border border-border/50 text-center ${
                  app.url ? "cursor-pointer" : "opacity-60"
                } group`}
              >
                <div className={`w-10 h-10 rounded-lg ${app.color || "bg-accent-green/10 text-accent-green-text"} flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform`}>
                  {app.icon}
                </div>
                <p className="text-xs font-medium text-foreground">{app.name}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="p-8 rounded-xl bg-card border border-border/50 text-center">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">Nessuna app attiva</h3>
            <p className="text-sm text-muted-foreground mt-1">Vai nella sezione Apps per attivare i tuoi strumenti</p>
            <button
              onClick={() => navigate("/apps")}
              className="mt-4 px-4 py-2 rounded-lg text-sm font-medium gradient-accent text-foreground hover:opacity-90 transition-opacity"
            >
              Esplora Apps
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

function KpiCard({ title, value, subtitle, icon, variant }: { title: string; value: string; subtitle: string; icon: React.ReactNode; variant: "default" | "orange" | "green" }) {
  const accentClasses = {
    default: "bg-secondary text-foreground",
    orange: "bg-accent-orange/10 text-accent-orange-text",
    green: "bg-accent-green/10 text-accent-green-text"
  };
  return (
    <div className="p-5 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-shadow border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentClasses[variant]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

export default HomePage;
