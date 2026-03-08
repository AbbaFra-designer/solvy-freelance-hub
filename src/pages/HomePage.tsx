import { TrendingUp, Percent, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApps } from "@/context/AppsContext";

const HomePage = () => {
  const { apps } = useApps();
  const activeApps = apps.filter((a) => a.active);
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const routeMap: Record<string, string> = {
    "id-contact": "/id-contact",
    "email-bozzer": "/email-bozzer",
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Ciao, Marco 👋</h1>
        <p className="text-muted-foreground text-sm mt-1 capitalize">{today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Fatturato del mese" value="€ 3.240" subtitle="+12% vs mese scorso" icon={<TrendingUp className="w-5 h-5" />} variant="default" />
        <KpiCard title="Tasse da accantonare" value="€ 486" subtitle="15% coefficiente ATECO 62.01" icon={<Percent className="w-5 h-5" />} variant="orange" />
        <KpiCard title="Pacchetti attivi" value={String(activeApps.length)} subtitle={`su ${apps.length} disponibili`} icon={<Package className="w-5 h-5" />} variant="green" />
      </div>

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
