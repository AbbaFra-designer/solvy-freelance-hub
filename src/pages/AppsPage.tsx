import { useApps } from "@/context/AppsContext";

const AppsPage = () => {
  const { apps, toggleApp } = useApps();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Apps</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestisci i tuoi strumenti di lavoro
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className={`relative p-5 rounded-xl border transition-all shadow-card hover:shadow-card-hover ${
              app.active ? "border-accent-green/30 bg-card" : "border-border bg-secondary/30"
            }`}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {app.free && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-green/15 text-accent-green-text">
                  Gratuito
                </span>
              )}
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  app.active
                    ? "gradient-accent text-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {app.active ? "Attivo" : "Inattivo"}
              </span>
            </div>

            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 ${
                app.active
                  ? "bg-accent-green/10 text-accent-green-text"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {app.icon}
            </div>

            <h3 className="font-semibold text-foreground text-sm">{app.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {app.description}
              {!app.free && <span className="ml-1 text-accent-orange-text font-medium">· €3,99/mese</span>}
            </p>

            <div className="mt-4">
              <button
                onClick={() => toggleApp(app.id)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  app.active ? "gradient-accent" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-card rounded-full shadow transition-transform ${
                    app.active ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppsPage;
