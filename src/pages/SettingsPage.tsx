const SettingsPage = () => {
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Impostazioni</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configura il tuo account e le preferenze
        </p>
      </div>

      {/* Profile Info */}
      <Section title="Informazioni profilo">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome" defaultValue="Marco" />
          <Field label="Cognome" defaultValue="Rossi" />
          <Field label="Email" defaultValue="marco@solvy.io" type="email" />
          <Field label="Telefono" defaultValue="+39 333 1234567" />
        </div>
      </Section>

      {/* Billing */}
      <Section title="Fatturazione & P.IVA">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Partita IVA" defaultValue="IT12345678901" />
          <Field label="Codice Fiscale" defaultValue="RSSMRC90A01H501Z" />
          <Field label="Codice ATECO" defaultValue="62.01.00" />
          <Field label="Coefficiente di redditività" defaultValue="67%" />
          <Field label="Indirizzo" defaultValue="Via Roma 42, Milano" className="sm:col-span-2" />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifiche">
        <div className="space-y-3">
          <ToggleRow label="Email per scadenze fiscali" defaultChecked />
          <ToggleRow label="Notifiche push per pagamenti" defaultChecked />
          <ToggleRow label="Report settimanale via email" defaultChecked={false} />
        </div>
      </Section>

      {/* Integrations */}
      <Section title="Integrazioni connesse">
        <div className="space-y-3">
          {["Google Calendar", "Stripe", "Fatture in Cloud"].map((name) => (
            <div
              key={name}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 text-sm"
            >
              <span className="text-foreground">{name}</span>
              <span className="text-xs text-muted-foreground">Connesso</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Save */}
      <button className="gradient-accent px-8 py-3 rounded-lg font-medium text-sm text-foreground hover:opacity-90 transition-opacity">
        Salva modifiche
      </button>
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
  className = "",
}: {
  label: string;
  defaultValue: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition"
      />
    </div>
  );
}

function ToggleRow({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-foreground">{label}</span>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="sr-only peer"
      />
      <div className="relative w-11 h-6 bg-muted peer-checked:bg-accent-green rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-card after:rounded-full after:h-5 after:w-5 after:shadow after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  );
}

export default SettingsPage;
