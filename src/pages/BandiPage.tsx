import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ExternalLink, Loader2, Settings2, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DEFAULT_SOURCES, BandiSource, RefreshFrequency } from "@/config/bandiSources";
import { useBandiFetch, BandiItem } from "@/hooks/useBandiFetch";
import { BandiSettingsPanel } from "@/components/bandi/BandiSettingsPanel";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const STORAGE_KEY_SOURCES = "solvy_bandi_sources";
const STORAGE_KEY_FREQ = "solvy_bandi_freq";
const STORAGE_KEY_LAST = "solvy_bandi_last_fetch";

function loadSources(): BandiSource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SOURCES);
    if (raw) {
      const saved = JSON.parse(raw) as BandiSource[];
      // Merge with defaults to pick up new sources & descriptions
      const savedIds = new Set(saved.map(s => s.id));
      const merged = saved.map(s => {
        const def = DEFAULT_SOURCES.find(d => d.id === s.id);
        return def ? { ...def, enabled: s.enabled } : s;
      });
      DEFAULT_SOURCES.forEach(d => {
        if (!savedIds.has(d.id)) merged.push(d);
      });
      return merged;
    }
  } catch {}
  return DEFAULT_SOURCES;
}

function loadFrequency(): RefreshFrequency {
  return (localStorage.getItem(STORAGE_KEY_FREQ) as RefreshFrequency) || "on_open";
}

function shouldFetch(freq: RefreshFrequency): boolean {
  if (freq === "on_open") return true;
  const last = localStorage.getItem(STORAGE_KEY_LAST);
  if (!last) return true;
  const elapsed = Date.now() - Number(last);
  if (freq === "every_6h") return elapsed > 6 * 60 * 60 * 1000;
  if (freq === "every_24h") return elapsed > 24 * 60 * 60 * 1000;
  return true;
}

const BandiPage = () => {
  const [sources, setSources] = useState<BandiSource[]>(loadSources);
  const [frequency, setFrequency] = useState<RefreshFrequency>(loadFrequency);
  const [showSettings, setShowSettings] = useState(false);
  const [search, setSearch] = useState("");
  const { items, loading, lastUpdate, sourceStatuses, fetchAll } = useBandiFetch();

  useEffect(() => { localStorage.setItem(STORAGE_KEY_SOURCES, JSON.stringify(sources)); }, [sources]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_FREQ, frequency); }, [frequency]);

  const doFetch = useCallback(() => {
    fetchAll(sources);
    localStorage.setItem(STORAGE_KEY_LAST, String(Date.now()));
  }, [fetchAll, sources]);

  useEffect(() => {
    if (shouldFetch(frequency)) doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSource = (id: string) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const addSource = (source: BandiSource) => {
    setSources((prev) => [...prev, source]);
  };

  const filtered = items.filter((item) => {
    if (!search) return true;
    const lower = search.toLowerCase();
    return item.title.toLowerCase().includes(lower) || item.sourceName.toLowerCase().includes(lower) || item.category.toLowerCase().includes(lower) || item.description.toLowerCase().includes(lower);
  });

  const categories = [...new Set(filtered.map((i) => i.category))];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Bandi & Finanziamenti</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Opportunità, premi e finanziamenti per designer e freelance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)} className="gap-2">
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Impostazioni</span>
          </Button>
          <Button variant="outline" size="icon" onClick={doFetch} disabled={loading} title="Aggiorna">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Aggiornamento opportunità in corso...</span>
        </div>
      )}

      {lastUpdate && !loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          Ultimo aggiornamento: {format(lastUpdate, "'oggi alle' HH:mm", { locale: it })}
        </div>
      )}

      {showSettings && (
        <BandiSettingsPanel
          sources={sources}
          onToggleSource={toggleSource}
          onAddSource={addSource}
          refreshFrequency={frequency}
          onSetFrequency={setFrequency}
        />
      )}

      <Input
        placeholder="Cerca opportunità, fonte o categoria..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-11 max-w-md"
      />

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">Nessuna opportunità trovata</p>
          <p className="text-sm mt-1">Prova a modificare i filtri o aggiorna le fonti</p>
        </div>
      )}

      {categories.map((cat) => {
        const catItems = filtered.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <section key={cat} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{cat}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {catItems.map((item) => (
                <BandiCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

function BandiCard({ item }: { item: BandiItem }) {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="block group">
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all h-full">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{item.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <Badge variant="secondary" className="text-[11px]">{item.sourceName}</Badge>
            {item.isNew && (
              <Badge className="text-[11px] bg-primary/15 text-primary border-transparent">
                Nuovo
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 pt-1">
            <ExternalLink className="w-3 h-3" />
            <span className="truncate">{new URL(item.link).hostname}</span>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

export default BandiPage;
