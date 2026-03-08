import { ArrowLeft, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const businessInfo = [
  { label: "Nome", value: "Marco Rossi" },
  { label: "Email", value: "marco@solvy.io" },
  { label: "Telefono", value: "+39 333 1234567" },
  { label: "Partita IVA", value: "IT12345678901" },
  { label: "Codice Fiscale", value: "RSSMRC90A01H501Z" },
  { label: "Codice SDI", value: "3C984HL" },
  { label: "Indirizzo", value: "Via Roma 42, Milano" },
];

const IdContactPage = () => {
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (value: string, index: number) => {
    navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    toast.success("Copiato negli appunti");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAll = () => {
    const text = businessInfo.map((i) => `${i.label}: ${i.value}`).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Tutti i dati copiati negli appunti");
  };

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors -mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Torna alla Home
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">ID Contact</h1>
        <p className="text-muted-foreground text-sm mt-1">
          I tuoi dati aziendali sempre a portata di mano
        </p>
      </div>

      {/* Card scontrino */}
      <div className="rounded-2xl border border-border bg-card shadow-card p-6 space-y-5">
        {/* Copy all button */}
        <div className="flex justify-end">
          <button
            onClick={copyAll}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
          >
            <Copy className="w-3.5 h-3.5" />
            Copia tutto
          </button>
        </div>

        {businessInfo.map((item, i) => (
          <div key={i} className="group">
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground break-all">{item.value}</p>
              <button
                onClick={() => copyToClipboard(item.value, i)}
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                title={`Copia ${item.label}`}
              >
                {copiedIndex === i ? (
                  <Check className="w-4 h-4 text-accent-green-text" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IdContactPage;