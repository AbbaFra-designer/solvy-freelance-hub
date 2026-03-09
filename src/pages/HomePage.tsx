import { TrendingUp, Percent, Package, Bell, Mail, Bot, Rocket, CalendarClock, Receipt, Users } from "lucide-react";
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

  const routeMap: Record<string, string> = {
    "id-contact": "/id-contact",
    "email-bozzer": "/email-bozzer",
    "preventivi": "/preventivi",
    "bandi": "/bandi",
  };

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

  useEffect(() => { loadReminders(); }, [loadReminders]);

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
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Ciao, {displayName} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1 capitalize">{today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Fatturato del mese" value="€ 3.240" subtitle="+12% vs mese scorso" icon={<TrendingUp className="w-5 h-5" />} variant="default" />
        <KpiCard title="Tasse da accantonare" value="€ 486" subtitle="15% coefficiente ATECO 62.01" icon={<Percent className="w-5 h-5" />} variant="orange" />
        <KpiCard title="Pacchetti attivi" value={String(activeApps.length)} subtitle={`su ${apps.length} disponibili`} icon={<Package className="w-5 h-5" />} variant="green" />
      </div>

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
                <div
                  key={r.id}
                  onClick={() => navigate("/email-bozzer")}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
                >
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

      {activeApps.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Accesso rapido</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeApps.map((app) => (
              <div
                key={app.id}
                onClick={() => routeMap[app.id] && navigate(routeMap[app.id])}
                className="p-5 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all border border-border/50 cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-lg bg-accent-green/10 text-accent-green-text flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {app.icon}
                </div>
                <h3 className="font-semibold text-foreground text-sm">{app.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{app.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

function KpiCard({ title, value, subtitle, icon, variant }: { title: string; value: string; subtitle: string; icon: React.ReactNode; variant: "default" | "orange" | "green" }) {
  const accentClasses = { default: "bg-secondary text-foreground", orange: "bg-accent-orange/10 text-accent-orange-text", green: "bg-accent-green/10 text-accent-green-text" };
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
