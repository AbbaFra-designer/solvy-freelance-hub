import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Settings2 } from "lucide-react";
import { BandiSource, RefreshFrequency } from "@/config/bandiSources";

interface Props {
  sources: BandiSource[];
  onToggleSource: (id: string) => void;
  onAddSource: (source: BandiSource) => void;
  refreshFrequency: RefreshFrequency;
  onSetFrequency: (f: RefreshFrequency) => void;
}

export function BandiSettingsPanel({ sources, onToggleSource, onAddSource, refreshFrequency, onSetFrequency }: Props) {
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim()) return;
    const id = `custom-${Date.now()}`;
    onAddSource({
      id,
      name: newName.trim(),
      url: newUrl.trim().startsWith("http") ? newUrl.trim() : `https://${newUrl.trim()}`,
      type: "page",
      category: "Personalizzata",
      enabled: true,
      description: "Fonte personalizzata aggiunta dall'utente.",
    });
    setNewName("");
    setNewUrl("");
  };

  const grouped = sources.reduce<Record<string, BandiSource[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  return (
    <Card className="border-border/50 shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          Impostazioni fonti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Refresh frequency */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Frequenza aggiornamento</Label>
          <Select value={refreshFrequency} onValueChange={(v) => onSetFrequency(v as RefreshFrequency)}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on_open">Ad ogni apertura</SelectItem>
              <SelectItem value="every_6h">Ogni 6 ore</SelectItem>
              <SelectItem value="every_24h">Ogni 24 ore</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Source toggles by category */}
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{cat}</p>
              <div className="space-y-2">
                {list.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-foreground truncate mr-3">{s.name}</span>
                    <Switch checked={s.enabled} onCheckedChange={() => onToggleSource(s.id)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add custom source */}
        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aggiungi fonte personalizzata</p>
          <Input placeholder="Nome fonte" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-10" />
          <Input placeholder="https://esempio.it/bandi" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="h-10" />
          <Button onClick={handleAdd} disabled={!newName.trim() || !newUrl.trim()} variant="outline" className="w-full gap-2">
            <Plus className="w-4 h-4" /> Aggiungi fonte
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
