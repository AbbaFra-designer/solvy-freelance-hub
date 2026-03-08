import { TrendingUp, Percent, Package } from "lucide-react";

const HomePage = () => {
  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
          Ciao, Marco 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1 capitalize">{today}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Fatturato del mese"
          value="€ 3.240"
          subtitle="+12% vs mese scorso"
          icon={<TrendingUp className="w-5 h-5" />}
          variant="default"
        />
        <KpiCard
          title="Tasse da accantonare"
          value="€ 810"
          subtitle="25% del fatturato"
          icon={<Percent className="w-5 h-5" />}
          variant="orange"
        />
        <KpiCard
          title="Pacchetti attivi"
          value="3"
          subtitle="su 5 disponibili"
          icon={<Package className="w-5 h-5" />}
          variant="green"
        />
      </div>

      {/* Recent Activity */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Attività recenti</h2>
        <div className="space-y-3">
          {[
            { text: "Fattura #034 inviata a Studio Rossi", time: "2 ore fa" },
            { text: "Tax Tracker: scadenza IVA aggiornata", time: "5 ore fa" },
            { text: "Nuovo contatto aggiunto: Maria Bianchi", time: "1 giorno fa" },
            { text: "Fattura #033 pagata da Luigi Verdi", time: "2 giorni fa" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 text-sm"
            >
              <span className="text-foreground">{item.text}</span>
              <span className="text-muted-foreground text-xs shrink-0 ml-4">{item.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Deadlines */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Prossime scadenze</h2>
        <div className="space-y-3">
          {[
            { label: "Versamento IVA trimestrale", date: "16 Mar 2026", urgent: true },
            { label: "Invio fattura — Studio Rossi", date: "20 Mar 2026", urgent: false },
            { label: "Rinnovo licenza software", date: "01 Apr 2026", urgent: false },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg border border-border text-sm"
            >
              <div className="flex items-center gap-3">
                {item.urgent && (
                  <span className="w-2 h-2 rounded-full bg-accent-orange shrink-0" />
                )}
                <span className="text-foreground">{item.label}</span>
              </div>
              <span className="text-muted-foreground text-xs shrink-0 ml-4">{item.date}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  variant,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  variant: "default" | "orange" | "green";
}) {
  const accentClasses = {
    default: "bg-secondary text-foreground",
    orange: "bg-accent-orange/10 text-accent-orange",
    green: "bg-accent-green/10 text-accent-green",
  };

  return (
    <div className="p-5 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-shadow border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentClasses[variant]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

export default HomePage;
