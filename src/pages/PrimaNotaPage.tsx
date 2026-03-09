import { useState, useEffect } from "react";
import { Upload, Plus, Trash2, Info, Monitor, BookOpen, Car, GraduationCap, Utensils, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  deductible: boolean;
  note: string;
}

const categories = [
  { value: "attrezzatura", label: "Attrezzatura", icon: Monitor },
  { value: "software", label: "Software & Abbonamenti", icon: BookOpen },
  { value: "trasporti", label: "Trasporti", icon: Car },
  { value: "formazione", label: "Formazione", icon: GraduationCap },
  { value: "pasti", label: "Pasti di lavoro", icon: Utensils },
  { value: "altro", label: "Altro", icon: MoreHorizontal },
];

const STORAGE_KEY = "solvy-prima-nota";

const defaultExpenses: Expense[] = [
  { id: "demo-1", amount: 49.99, date: "2026-03-01", category: "software", deductible: true, note: "Abbonamento Figma" },
  { id: "demo-2", amount: 12.50, date: "2026-03-05", category: "pasti", deductible: true, note: "Pranzo con cliente" },
];

export default function PrimaNotaPage() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || defaultExpenses; }
    catch { return defaultExpenses; }
  });

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = useState("attrezzatura");
  const [deductible, setDeductible] = useState(true);
  const [note, setNote] = useState("");

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)); }, [expenses]);

  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const deductibleMonth = monthExpenses.filter((e) => e.deductible).reduce((s, e) => s + e.amount, 0);

  const addExpense = () => {
    if (!amount || isNaN(Number(amount))) return;
    setExpenses((prev) => [
      { id: crypto.randomUUID(), amount: Number(amount), date, category, deductible, note },
      ...prev,
    ]);
    setAmount("");
    setNote("");
  };

  const deleteExpense = (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id));
  const getCatIcon = (cat: string) => categories.find((c) => c.value === cat)?.icon || MoreHorizontal;
  const getCatLabel = (cat: string) => categories.find((c) => c.value === cat)?.label || cat;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Prima Nota</h1>
        <p className="text-muted-foreground text-sm mt-1">Traccia le tue spese professionali.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-card border border-border/50 shadow-card">
          <p className="text-sm text-muted-foreground">Spese del mese</p>
          <p className="text-2xl font-semibold text-foreground mt-1">€{totalMonth.toFixed(2)}</p>
        </div>
        <div className="p-5 rounded-xl bg-card border border-border/50 shadow-card">
          <p className="text-sm text-muted-foreground">Deducibili</p>
          <p className="text-2xl font-semibold text-accent-green-text mt-1">€{deductibleMonth.toFixed(2)}</p>
        </div>
      </div>

      {/* Upload area */}
      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Scatta o carica uno scontrino — JPG, PNG, PDF max 5MB</p>
        <button className="mt-3 text-sm px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-colors">
          Carica file
        </button>
      </div>

      {/* Form */}
      <div className="p-5 rounded-xl bg-card border border-border/50 shadow-card space-y-4">
        <h3 className="font-semibold text-foreground text-sm">Inserimento manuale</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Importo (€)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
            {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-foreground">Deducibile?</label>
          <button
            onClick={() => setDeductible(!deductible)}
            className={`relative w-11 h-6 rounded-full transition-colors ${deductible ? "gradient-accent" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-card rounded-full shadow transition-transform ${deductible ? "translate-x-5" : "translate-x-0"}`} />
          </button>
          <span className="text-sm text-muted-foreground">{deductible ? "Sì" : "No"}</span>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Note (opzionale)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Es. pranzo con cliente"
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button onClick={addExpense} className="w-full py-2.5 rounded-lg gradient-accent text-foreground font-medium text-sm flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Aggiungi spesa
        </button>
      </div>

      {/* Entries */}
      {expenses.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground text-sm">Spese registrate</h3>
          {expenses.map((e) => {
            const Icon = getCatIcon(e.category);
            return (
              <div key={e.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/50 shadow-card">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{e.note || getCatLabel(e.category)}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(e.date), "d MMM yyyy", { locale: it })}</p>
                </div>
                <span className="text-sm font-semibold text-foreground shrink-0">€{e.amount.toFixed(2)}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${e.deductible ? "bg-accent-green/15 text-accent-green-text" : "bg-destructive/15 text-destructive"}`}>
                  {e.deductible ? "✅ Deducibile" : "❌ Non deducibile"}
                </span>
                <button onClick={() => deleteExpense(e.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Info box */}
      <div className="flex gap-3 p-4 rounded-xl bg-secondary">
        <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          💡 In regime forfettario le spese non riducono il reddito analiticamente, ma tenerle tracciate aiuta il tuo commercialista a valutare la tua situazione.
        </p>
      </div>
    </div>
  );
}
