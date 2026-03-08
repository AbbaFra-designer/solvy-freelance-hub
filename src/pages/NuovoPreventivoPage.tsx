import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Download, Send, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PreventivoVoce, defaultTermini } from "@/types/preventivo";
import { EmailModal } from "@/components/preventivi/EmailModal";
import { generatePDF } from "@/lib/preventivoPdf";
import { usePreventivi } from "@/context/PreventiviContext";
import { toast } from "sonner";

const emptyVoce = (): PreventivoVoce => ({
  id: crypto.randomUUID(),
  descrizione: "",
  quantita: 1,
  unita: "ore",
  prezzoUnitario: 0,
});

export default function NuovoPreventivoPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getPreventivo, addPreventivo, updatePreventivo } = usePreventivi();
  const isEditing = !!id;

  const [showEmail, setShowEmail] = useState(false);

  // Section 1 — Cover
  const [nomeProgetto, setNomeProgetto] = useState("");
  const [sottotitolo, setSottotitolo] = useState("Preventivo");
  const [nomeCliente, setNomeCliente] = useState("");
  const [dataPreventivo, setDataPreventivo] = useState<Date>(new Date());
  const [numeroPreventivo, setNumeroPreventivo] = useState(
    `PRV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`
  );
  const [logoFreelancer, setLogoFreelancer] = useState<string>("");
  const [logoCliente, setLogoCliente] = useState<string>("");
  const [logoCollaboratori, setLogoCollaboratori] = useState<string[]>([]);

  // Section 2 — Brief
  const [brief, setBrief] = useState("");

  // Section 3 — Pricing
  const [voci, setVoci] = useState<PreventivoVoce[]>([emptyVoce()]);
  const [ivaEnabled, setIvaEnabled] = useState(true);
  const [tempistiche, setTempistiche] = useState("");
  const [validitaGiorni, setValiditaGiorni] = useState("30");

  // Section 4 — T&C
  const [termini, setTermini] = useState(defaultTermini);

  // Load existing preventivo data for editing
  useEffect(() => {
    if (!id) return;
    const existing = getPreventivo(id);
    if (!existing) {
      toast.error("Preventivo non trovato");
      navigate("/preventivi");
      return;
    }
    setNomeProgetto(existing.nomeProgetto);
    setSottotitolo(existing.sottotitolo);
    setNomeCliente(existing.nomeCliente);
    setDataPreventivo(new Date(existing.dataEmissione));
    setNumeroPreventivo(existing.numero);
    setLogoFreelancer(existing.logoFreelancer || "");
    setLogoCliente(existing.logoCliente || "");
    setLogoCollaboratori(existing.logoCollaboratori || []);
    setBrief(existing.brief.replace(/<[^>]+>/g, ""));
    setVoci(existing.voci.length > 0 ? existing.voci : [emptyVoce()]);
    setIvaEnabled(existing.ivaPercentuale > 0);
    setTempistiche(existing.tempistiche);
    setTermini(existing.terminiCondizioni);
    // Calculate validity days from dates
    const emDate = new Date(existing.dataEmissione);
    const valDate = new Date(existing.dataValidita);
    const diffDays = Math.round((valDate.getTime() - emDate.getTime()) / 86400000);
    setValiditaGiorni(String(diffDays > 0 ? diffDays : 30));
  }, [id]);

  const subtotal = voci.reduce((s, v) => s + v.quantita * v.prezzoUnitario, 0);
  const ivaAmount = ivaEnabled ? subtotal * 0.22 : 0;
  const total = subtotal + ivaAmount;

  const handleFileUpload = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addCollaboratore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoCollaboratori((prev) => [...prev, reader.result as string]);
    reader.readAsDataURL(file);
  };

  const updateVoce = (voceId: string, field: keyof PreventivoVoce, value: string | number) => {
    setVoci((prev) => prev.map((v) => (v.id === voceId ? { ...v, [field]: value } : v)));
  };

  const buildPreventivo = () => ({
    id: id || crypto.randomUUID(),
    numero: numeroPreventivo,
    nomeProgetto,
    sottotitolo,
    nomeCliente,
    dataEmissione: format(dataPreventivo, "yyyy-MM-dd"),
    dataValidita: format(
      new Date(dataPreventivo.getTime() + parseInt(validitaGiorni) * 86400000),
      "yyyy-MM-dd"
    ),
    stato: "bozza" as const,
    brief: `<p>${brief}</p>`,
    voci,
    ivaPercentuale: ivaEnabled ? 22 : 0,
    tempistiche,
    terminiCondizioni: termini,
    logoFreelancer,
    logoCliente,
    logoCollaboratori,
  });

  const validate = () => {
    if (!nomeProgetto.trim()) { toast.error("Inserisci il nome del progetto"); return false; }
    if (!nomeCliente.trim()) { toast.error("Inserisci il nome del cliente"); return false; }
    if (voci.length === 0 || voci.every((v) => !v.descrizione.trim())) {
      toast.error("Aggiungi almeno una voce alla tabella prezzi"); return false;
    }
    return true;
  };

  const handleSaveDraft = () => {
    if (!validate()) return;
    const p = buildPreventivo();
    if (isEditing) {
      updatePreventivo(p);
      toast.success("Preventivo aggiornato!");
    } else {
      addPreventivo(p);
      toast.success("Bozza salvata con successo!");
    }
    navigate("/preventivi");
  };

  const handleDownloadPDF = () => {
    if (!validate()) return;
    const p = buildPreventivo();
    if (isEditing) updatePreventivo(p);
    generatePDF(p);
    toast.success("PDF generato e scaricato");
  };

  const handleSendEmail = () => {
    if (!validate()) return;
    setShowEmail(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/preventivi")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? "Modifica Preventivo" : "Nuovo Preventivo"}
            </h1>
            <p className="text-sm text-muted-foreground">Compila le sezioni per generare il PDF</p>
          </div>
        </div>
      </div>

      {/* Section 1 — Cover */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-foreground">1</span>
            Copertina PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nome Progetto *</Label>
            <Input value={nomeProgetto} onChange={(e) => setNomeProgetto(e.target.value)} placeholder="Es. Restyling Sito Web" />
          </div>
          <div className="space-y-2">
            <Label>Sottotitolo</Label>
            <Input value={sottotitolo} onChange={(e) => setSottotitolo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Nome Cliente *</Label>
            <Input value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} placeholder="Es. Mario Rossi SRL" />
          </div>
          <div className="space-y-2">
            <Label>Numero Preventivo</Label>
            <Input value={numeroPreventivo} onChange={(e) => setNumeroPreventivo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Data Preventivo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dataPreventivo && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dataPreventivo, "PPP", { locale: it })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dataPreventivo} onSelect={(d) => d && setDataPreventivo(d)} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div />

          {/* Logos */}
          <div className="space-y-2">
            <Label>Logo Freelancer</Label>
            <LogoUpload value={logoFreelancer} onChange={handleFileUpload(setLogoFreelancer)} onClear={() => setLogoFreelancer("")} />
          </div>
          <div className="space-y-2">
            <Label>Logo Cliente</Label>
            <LogoUpload value={logoCliente} onChange={handleFileUpload(setLogoCliente)} onClear={() => setLogoCliente("")} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Logo Collaboratori</Label>
            <div className="flex flex-wrap gap-3">
              {logoCollaboratori.map((logo, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg border border-border overflow-hidden group">
                  <img src={logo} alt="" className="w-full h-full object-contain" />
                  <button
                    onClick={() => setLogoCollaboratori((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-foreground/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-background" />
                  </button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-accent-green transition-colors">
                <Plus className="w-5 h-5 text-muted-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={addCollaboratore} />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — Brief */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-foreground">2</span>
            Brief del Progetto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="mb-2 block">Descrizione del progetto e obiettivi</Label>
          <Textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Descrivi il contesto, gli obiettivi e il perimetro del progetto..."
            className="min-h-[180px]"
          />
        </CardContent>
      </Card>

      {/* Section 3 — Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-foreground">3</span>
            Tabella Prezzi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-2 font-medium">Descrizione</th>
                  <th className="text-center py-2 px-2 font-medium w-20">Qtà</th>
                  <th className="text-center py-2 px-2 font-medium w-28">Unità</th>
                  <th className="text-right py-2 px-2 font-medium w-28">Prezzo (€)</th>
                  <th className="text-right py-2 px-2 font-medium w-28">Totale</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {voci.map((v) => (
                  <tr key={v.id} className="border-b border-border/50">
                    <td className="py-2 px-2">
                      <Input value={v.descrizione} onChange={(e) => updateVoce(v.id, "descrizione", e.target.value)} placeholder="Attività..." className="h-9" />
                    </td>
                    <td className="py-2 px-2">
                      <Input type="number" min={1} value={v.quantita} onChange={(e) => updateVoce(v.id, "quantita", parseFloat(e.target.value) || 0)} className="h-9 text-center" />
                    </td>
                    <td className="py-2 px-2">
                      <Select value={v.unita} onValueChange={(val) => updateVoce(v.id, "unita", val)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ore">Ore</SelectItem>
                          <SelectItem value="giorni">Giorni</SelectItem>
                          <SelectItem value="pezzi">Pezzi</SelectItem>
                          <SelectItem value="forfait">Forfait</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2 px-2">
                      <Input type="number" min={0} step={0.01} value={v.prezzoUnitario} onChange={(e) => updateVoce(v.id, "prezzoUnitario", parseFloat(e.target.value) || 0)} className="h-9 text-right" />
                    </td>
                    <td className="py-2 px-2 text-right font-semibold">
                      €{(v.quantita * v.prezzoUnitario).toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-2">
                      {voci.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setVoci((prev) => prev.filter((x) => x.id !== v.id))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button variant="outline" size="sm" onClick={() => setVoci((prev) => [...prev, emptyVoce()])}>
            <Plus className="w-4 h-4 mr-1" /> Aggiungi voce
          </Button>

          {/* Totals */}
          <div className="flex flex-col items-end gap-2 pt-4 border-t border-border">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Subtotale:</span>
              <span className="font-medium w-28 text-right">€{subtotal.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">IVA 22%:</span>
                <Switch checked={ivaEnabled} onCheckedChange={setIvaEnabled} />
              </div>
              <span className="font-medium w-28 text-right">€{ivaAmount.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center gap-4 text-lg font-bold pt-2 border-t border-border">
              <span>Totale:</span>
              <span className="w-28 text-right gradient-accent-text">€{total.toLocaleString("it-IT", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-4">
            <div className="space-y-2">
              <Label>Tempistiche stimate</Label>
              <Input value={tempistiche} onChange={(e) => setTempistiche(e.target.value)} placeholder="Es. 4 settimane a partire dall'approvazione" />
            </div>
            <div className="space-y-2">
              <Label>Validità preventivo (giorni)</Label>
              <Input type="number" min={1} value={validitaGiorni} onChange={(e) => setValiditaGiorni(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4 — Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-foreground">4</span>
            Termini e Condizioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={termini}
            onChange={(e) => setTermini(e.target.value)}
            className="min-h-[200px] font-mono text-xs"
          />
        </CardContent>
      </Card>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-16 lg:left-56 bg-card/95 backdrop-blur border-t border-border p-4 z-40 safe-area-bottom">
        <div className="flex flex-wrap items-center justify-end gap-3 max-w-5xl mx-auto">
          <Button variant="secondary" onClick={handleSaveDraft}>
            <Save className="w-4 h-4 mr-2" /> {isEditing ? "Salva Modifiche" : "Salva Bozza"}
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" /> Scarica PDF
          </Button>
          <Button className="gradient-accent text-foreground font-semibold" onClick={handleSendEmail}>
            <Send className="w-4 h-4 mr-2" /> Invia via Email
          </Button>
        </div>
      </div>

      {showEmail && (
        <EmailModal preventivo={buildPreventivo()} onClose={() => setShowEmail(false)} />
      )}
    </div>
  );
}

function LogoUpload({ value, onChange, onClear }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onClear: () => void }) {
  if (value) {
    return (
      <div className="relative w-20 h-20 rounded-lg border border-border overflow-hidden group">
        <img src={value} alt="" className="w-full h-full object-contain" />
        <button onClick={onClear} className="absolute inset-0 bg-foreground/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <X className="w-4 h-4 text-background" />
        </button>
      </div>
    );
  }
  return (
    <label className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-accent-green transition-colors">
      <Upload className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Carica immagine</span>
      <input type="file" accept="image/*" className="hidden" onChange={onChange} />
    </label>
  );
}
