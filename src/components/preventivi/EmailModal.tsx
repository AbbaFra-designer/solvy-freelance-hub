import { useState } from "react";
import { Send, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Preventivo } from "@/types/preventivo";
import { toast } from "sonner";

interface EmailModalProps {
  preventivo: Preventivo;
  onClose: () => void;
}

export function EmailModal({ preventivo, onClose }: EmailModalProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(`Preventivo — ${preventivo.nomeProgetto}`);
  const [body, setBody] = useState(
    `Gentile Cliente,\n\nIn allegato il preventivo "${preventivo.nomeProgetto}" (${preventivo.numero}).\n\nResto a disposizione per qualsiasi chiarimento.\n\nCordiali saluti`
  );
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!to.trim()) { toast.error("Inserisci l'indirizzo email del destinatario"); return; }
    setSending(true);
    // Simulated send
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    toast.success("Email inviata con successo!");
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invia Preventivo via Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Destinatario *</Label>
            <Input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="email@cliente.it" />
          </div>
          <div className="space-y-2">
            <Label>Oggetto</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Messaggio</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[140px]" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <span>📎</span>
            <span>{preventivo.numero}_{preventivo.nomeProgetto.replace(/\s+/g, "_")}.pdf</span>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button
            variant="outline"
            onClick={() => {
              toast.success("PDF scaricato per la revisione");
              onClose();
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Scarica per review
          </Button>
          <Button className="gradient-accent text-foreground font-semibold" onClick={handleSend} disabled={sending}>
            <Send className="w-4 h-4 mr-2" />
            {sending ? "Invio in corso..." : "Invia Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
