import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Download, Mail, Pencil, Trash2, Search, ArrowUpDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Preventivo, PreventivoStatus } from "@/types/preventivo";
import { EmailModal } from "@/components/preventivi/EmailModal";
import { generatePDF } from "@/lib/preventivoPdf";
import { usePreventivi } from "@/context/PreventiviContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const statusConfig: Record<PreventivoStatus, { label: string; className: string }> = {
  bozza: { label: "Bozza", className: "bg-muted text-muted-foreground" },
  inviato: { label: "Inviato", className: "bg-blue-500/15 text-blue-700" },
  accettato: { label: "Accettato", className: "bg-emerald-500/15 text-emerald-700" },
  rifiutato: { label: "Rifiutato", className: "bg-red-500/15 text-red-700" },
};

type SortField = "numero" | "nomeProgetto" | "nomeCliente" | "dataEmissione" | "importo" | "stato";

export default function PreventiviPage() {
  const navigate = useNavigate();
  const { preventivi, deletePreventivo } = usePreventivi();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("dataEmissione");
  const [sortAsc, setSortAsc] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [emailPreventivo, setEmailPreventivo] = useState<Preventivo | null>(null);

  const pdfColors = profile ? {
    colorStart: (profile as any).pdf_color_start || "#AAFF45",
    colorEnd: (profile as any).pdf_color_end || "#FF6B1A",
    mode: ((profile as any).pdf_color_mode || "gradient") as "gradient" | "colorful",
  } : undefined;

  const getImporto = (p: Preventivo) =>
    p.voci.reduce((s, v) => s + v.quantita * v.prezzoUnitario, 0);

  const sorted = useMemo(() => {
    let list = preventivi.filter(
      (p) =>
        p.nomeCliente.toLowerCase().includes(search.toLowerCase()) ||
        p.nomeProgetto.toLowerCase().includes(search.toLowerCase()) ||
        p.numero.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "numero": cmp = a.numero.localeCompare(b.numero); break;
        case "nomeProgetto": cmp = a.nomeProgetto.localeCompare(b.nomeProgetto); break;
        case "nomeCliente": cmp = a.nomeCliente.localeCompare(b.nomeCliente); break;
        case "dataEmissione": cmp = a.dataEmissione.localeCompare(b.dataEmissione); break;
        case "importo": cmp = getImporto(a) - getImporto(b); break;
        case "stato": cmp = a.stato.localeCompare(b.stato); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [preventivi, search, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deletePreventivo(deleteId);
    setDeleteId(null);
    toast.success("Preventivo eliminato");
  };

  const handleDownload = (p: Preventivo) => {
    generatePDF(p, pdfColors);
    toast.success("PDF scaricato");
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 hover:text-foreground transition-colors">
      {children}
      <ArrowUpDown className="w-3 h-3 opacity-50" />
    </button>
  );

  return (
    <div className="space-y-8 animate-fade-in p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Preventivi</h1>
          <p className="text-sm text-muted-foreground">Gestisci i tuoi preventivi e genera PDF professionali</p>
        </div>
        <Button
          onClick={() => navigate("/preventivi/nuovo")}
          className="gradient-accent text-foreground font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus className="w-4 h-4 mr-2" /> Nuovo Preventivo
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca per cliente, progetto o numero..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="py-4 px-5"><SortHeader field="numero">#ID</SortHeader></TableHead>
              <TableHead className="py-4 px-5"><SortHeader field="nomeProgetto">Nome Progetto</SortHeader></TableHead>
              <TableHead className="py-4 px-5"><SortHeader field="nomeCliente">Cliente</SortHeader></TableHead>
              <TableHead className="hidden md:table-cell py-4 px-5"><SortHeader field="dataEmissione">Data Emissione</SortHeader></TableHead>
              <TableHead className="text-right py-4 px-5"><SortHeader field="importo">Importo</SortHeader></TableHead>
              <TableHead className="py-4 px-5"><SortHeader field="stato">Stato</SortHeader></TableHead>
              <TableHead className="text-right py-4 px-5">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                  Nessun preventivo trovato
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((p) => {
                const cfg = statusConfig[p.stato];
                return (
                  <TableRow key={p.id} className="group hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground py-4 px-5">{p.numero}</TableCell>
                    <TableCell className="font-medium py-4 px-5">{p.nomeProgetto}</TableCell>
                    <TableCell className="py-4 px-5">{p.nomeCliente}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground py-4 px-5">
                      {new Date(p.dataEmissione).toLocaleDateString("it-IT")}
                    </TableCell>
                    <TableCell className="text-right font-semibold py-4 px-5">
                      €{getImporto(p).toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="py-4 px-5">
                      <Badge className={cfg.className}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell className="py-4 px-5">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9" title="Scarica PDF" onClick={() => handleDownload(p)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9" title="Scarica per review" onClick={() => { generatePDF(p, pdfColors); toast.success("PDF scaricato per la revisione"); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9" title="Invia via Email" onClick={() => setEmailPreventivo(p)}>
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9" title="Modifica" onClick={() => navigate(`/preventivi/modifica/${p.id}`)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive" title="Elimina" onClick={() => setDeleteId(p.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo preventivo?</AlertDialogTitle>
            <AlertDialogDescription>Questa azione non può essere annullata.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email modal */}
      {emailPreventivo && (
        <EmailModal preventivo={emailPreventivo} onClose={() => setEmailPreventivo(null)} />
      )}
    </div>
  );
}
