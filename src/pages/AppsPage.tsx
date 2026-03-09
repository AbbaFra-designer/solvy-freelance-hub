import { useApps } from "@/context/AppsContext";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const AppsPage = () => {
  const { apps, toggleApp } = useApps();
  const navigate = useNavigate();

  const activeApps = apps.filter((app) => app.active);
  const inactiveApps = apps.filter((app) => !app.active);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Apps</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Attiva e gestisci i pacchetti per il tuo lavoro da freelance
        </p>
      </div>

      {/* Active Apps */}
      {activeApps.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Attivi · {activeApps.length}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeApps.map((app) => (
              <div
                key={app.id}
                className="relative p-5 rounded-xl border border-accent-green/30 bg-card transition-all shadow-card hover:shadow-card-hover"
              >
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {app.free && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-green/15 text-accent-green-text">
                      Gratuito
                    </span>
                  )}
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full gradient-accent text-foreground">
                    Attivo
                  </span>
                </div>

                <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 ${app.color || "bg-accent-green/10 text-accent-green-text"}`}>
                  {app.icon}
                </div>

                <h3 className="font-semibold text-foreground text-sm">{app.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {app.description}
                  {!app.free && <span className="ml-1 text-accent-orange-text font-medium">· €3,99/mese</span>}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  {app.url && (
                    <button
                      onClick={() => navigate(app.url)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium gradient-accent text-foreground hover:opacity-90 transition-opacity"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Apri
                    </button>
                  )}
                  <button
                    onClick={() => toggleApp(app.id)}
                    className="relative w-11 h-6 rounded-full transition-colors gradient-accent"
                  >
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-card rounded-full shadow transition-transform translate-x-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Apps */}
      {inactiveApps.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Disponibili · {inactiveApps.length}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveApps.map((app) => (
              <div
                key={app.id}
                className="relative p-5 rounded-xl border border-border bg-secondary/30 transition-all shadow-card hover:shadow-card-hover"
              >
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Inattivo
                  </span>
                </div>

                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4 bg-muted text-muted-foreground">
                  {app.icon}
                </div>

                <h3 className="font-semibold text-foreground text-sm">{app.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {app.description}
                  {!app.free ? (
                    <span className="ml-1 text-accent-orange-text font-medium">· €3,99/mese</span>
                  ) : (
                    <span className="ml-1 text-accent-green-text font-medium">· Gratuito</span>
                  )}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => toggleApp(app.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-secondary transition-colors"
                  >
                    Attiva
                  </button>
                  <button
                    onClick={() => toggleApp(app.id)}
                    className="relative w-11 h-6 rounded-full transition-colors bg-muted"
                  >
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-card rounded-full shadow transition-transform translate-x-0" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppsPage;
