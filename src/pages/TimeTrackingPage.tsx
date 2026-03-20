import { useState, useEffect, useRef } from "react";
import {
  Timer, Play, Pause, Square, Plus, Link2, TrendingUp,
  ChevronDown, ChevronRight, Clock, Euro, AlertCircle,
  Briefcase, Home as HomeIcon, Bell, Check, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────
type ProjectType = "client" | "overhead";

type Task = {
  id: string;
  name: string;
  hoursLogged: number;
};

type Project = {
  id: string;
  name: string;
  client: string;
  type: ProjectType;
  budgetHours: number;
  value: number;
  linkedPreventivo?: string;
  color: string;
  tasks: Task[];
};

// ─── Seed data ───────────────────────────────────────────────────────────────
const INITIAL_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Sito Web E-Commerce",
    client: "Luca Ferretti",
    type: "client",
    budgetHours: 40,
    value: 2000,
    color: "bg-accent-green/10 text-accent-green-text",
    tasks: [
      { id: "t1a", name: "Design UI/UX", hoursLogged: 8 },
      { id: "t1b", name: "Sviluppo Frontend", hoursLogged: 12 },
      { id: "t1c", name: "Integrazione Pagamenti", hoursLogged: 5 },
    ],
  },
  {
    id: "p2",
    name: "Social Media Management",
    client: "Studio Legale Rossi",
    type: "client",
    budgetHours: 20,
    value: 900,
    color: "bg-blue-500/10 text-blue-700",
    tasks: [
      { id: "t2a", name: "Pianificazione Contenuti", hoursLogged: 3 },
      { id: "t2b", name: "Creazione Post", hoursLogged: 7 },
      { id: "t2c", name: "Analisi Performance", hoursLogged: 2 },
    ],
  },
  {
    id: "p3",
    name: "App Mobile MVP",
    client: "Startup Nexto",
    type: "client",
    budgetHours: 120,
    value: 8000,
    color: "bg-purple-500/10 text-purple-700",
    tasks: [
      { id: "t3a", name: "Architettura e Setup", hoursLogged: 10 },
      { id: "t3b", name: "Autenticazione Utenti", hoursLogged: 8 },
      { id: "t3c", name: "Interfaccia Principale", hoursLogged: 15 },
    ],
  },
  {
    id: "oh1",
    name: "Fatturazione & Amministrazione",
    client: "—",
    type: "overhead",
    budgetHours: 8,
    value: 0,
    color: "bg-muted text-muted-foreground",
    tasks: [
      { id: "oh1a", name: "Emissione Fatture", hoursLogged: 2 },
      { id: "oh1b", name: "Prima Nota", hoursLogged: 1 },
    ],
  },
  {
    id: "oh2",
    name: "Ricerca Clienti & Marketing",
    client: "—",
    type: "overhead",
    budgetHours: 10,
    value: 0,
    color: "bg-accent-orange/10 text-accent-orange-text",
    tasks: [
      { id: "oh2a", name: "Cold Outreach", hoursLogged: 3 },
      { id: "oh2b", name: "LinkedIn e Networking", hoursLogged: 2 },
    ],
  },
  {
    id: "oh3",
    name: "Ricerca Nuove Tecnologie",
    client: "—",
    type: "overhead",
    budgetHours: 8,
    value: 0,
    color: "bg-sky-500/10 text-sky-700",
    tasks: [
      { id: "oh3a", name: "Studio Framework", hoursLogged: 4 },
      { id: "oh3b", name: "Corsi e Tutorial", hoursLogged: 3 },
    ],
  },
];

const PREVENTIVI_MOCK = [
  { id: "prev-001", label: "PRV-001 · Sito Web E-Commerce · 40h · €2.000" },
  { id: "prev-002", label: "PRV-002 · Social Media Management · 20h · €900" },
  { id: "prev-003", label: "PRV-003 · App Mobile MVP · 120h · €8.000" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTotalLogged(p: Project) {
  return p.tasks.reduce((s, t) => s + t.hoursLogged, 0);
}
function getRealRate(p: Project): number | null {
  const h = getTotalLogged(p);
  return h > 0 && p.value > 0 ? Math.round(p.value / h) : null;
}
function fmt(secs: number) {
  const h = Math.floor(secs / 3600).toString().padStart(2, "0");
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TimeTrackingPage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [expanded, setExpanded] = useState<string | null>("p1");

  // Timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSecs, setTimerSecs] = useState(0);
  const [timerProjectId, setTimerProjectId] = useState("");
  const [timerTaskId, setTimerTaskId] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Log manual hours dialog
  const [logOpen, setLogOpen] = useState(false);
  const [logProjectId, setLogProjectId] = useState("");
  const [logTaskId, setLogTaskId] = useState("");
  const [logHours, setLogHours] = useState("");
  const [logNote, setLogNote] = useState("");

  // Link preventivo dialog
  const [linkOpen, setLinkOpen] = useState<string | null>(null);
  const [linkPreventivoId, setLinkPreventivoId] = useState("");

  // New project dialog
  const [newProjOpen, setNewProjOpen] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjClient, setNewProjClient] = useState("");
  const [newProjType, setNewProjType] = useState<ProjectType>("client");
  const [newProjBudget, setNewProjBudget] = useState("");
  const [newProjValue, setNewProjValue] = useState("");
  const [newTaskName, setNewTaskName] = useState("");

  // Reminder dismissed
  const [reminderDismissed, setReminderDismissed] = useState(false);

  // ── Timer logic ──
  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => setTimerSecs((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning]);

  const addHours = (projectId: string, taskId: string, hours: number) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id !== projectId ? p : {
          ...p,
          tasks: p.tasks.map((t) =>
            t.id !== taskId ? t : { ...t, hoursLogged: Math.round((t.hoursLogged + hours) * 100) / 100 }
          ),
        }
      )
    );
  };

  const handleStartTimer = () => {
    if (!timerProjectId || !timerTaskId) {
      toast.error("Seleziona un progetto e un task prima di avviare");
      return;
    }
    setTimerRunning(true);
  };

  const handleStopTimer = () => {
    setTimerRunning(false);
    if (timerSecs > 30 && timerProjectId && timerTaskId) {
      const hours = Math.round((timerSecs / 3600) * 100) / 100;
      addHours(timerProjectId, timerTaskId, hours);
      const proj = projects.find((p) => p.id === timerProjectId);
      toast.success(`${hours}h registrate su "${proj?.name}"`);
    }
    setTimerSecs(0);
  };

  const handleLogManual = () => {
    const h = parseFloat(logHours);
    if (!logProjectId || !logTaskId || isNaN(h) || h <= 0) return;
    addHours(logProjectId, logTaskId, h);
    toast.success(`${h}h registrate correttamente`);
    setLogOpen(false);
    setLogHours(""); setLogNote(""); setLogProjectId(""); setLogTaskId("");
  };

  const handleLinkPreventivo = () => {
    if (!linkOpen || !linkPreventivoId) return;
    setProjects((prev) =>
      prev.map((p) => p.id === linkOpen ? { ...p, linkedPreventivo: linkPreventivoId } : p)
    );
    toast.success("Preventivo collegato al progetto");
    setLinkOpen(null); setLinkPreventivoId("");
  };

  const handleNewProject = () => {
    if (!newProjName || !newProjBudget) return;
    const newP: Project = {
      id: `p-${Date.now()}`,
      name: newProjName,
      client: newProjClient || "—",
      type: newProjType,
      budgetHours: parseFloat(newProjBudget),
      value: parseFloat(newProjValue) || 0,
      color: "bg-accent-green/10 text-accent-green-text",
      tasks: [{ id: `t-${Date.now()}`, name: newTaskName || "Task principale", hoursLogged: 0 }],
    };
    setProjects((prev) => [...prev, newP]);
    toast.success(`Progetto "${newProjName}" creato`);
    setNewProjOpen(false);
    setNewProjName(""); setNewProjClient(""); setNewProjBudget(""); setNewProjValue(""); setNewTaskName("");
  };

  // ── ROI stats ──
  const clientProjects = projects.filter((p) => p.type === "client");
  const overheadProjects = projects.filter((p) => p.type === "overhead");
  const totalBillable = clientProjects.reduce((s, p) => s + getTotalLogged(p), 0);
  const totalValue = clientProjects.reduce((s, p) => s + p.value, 0);
  const totalOverhead = overheadProjects.reduce((s, p) => s + getTotalLogged(p), 0);
  const avgRate = totalBillable > 0 ? Math.round(totalValue / totalBillable) : 0;
  const effectiveRate = (totalBillable + totalOverhead) > 0
    ? Math.round(totalValue / (totalBillable + totalOverhead)) : 0;

  const timerProject = projects.find((p) => p.id === timerProjectId);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Time Tracking & ROI</h1>
          <p className="text-sm text-muted-foreground mt-1">Traccia le ore, collega i preventivi e scopri la tua tariffa reale</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLogOpen(true)}>
            <Clock className="w-4 h-4 mr-2" /> Registra Ore
          </Button>
          <Button onClick={() => setNewProjOpen(true)} className="gradient-accent text-foreground font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Nuovo Progetto
          </Button>
        </div>
      </div>

      {/* ── Daily reminder ── */}
      {!reminderDismissed && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-accent-orange/30 bg-accent-orange/5">
          <Bell className="w-4 h-4 text-accent-orange-text shrink-0" />
          <p className="text-sm text-accent-orange-text">
            <strong>Promemoria giornaliero:</strong> hai registrato le ore di oggi? Fallo prima di fine giornata 🕐
          </p>
          <button
            onClick={() => setReminderDismissed(true)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground shrink-0 transition-colors"
          >
            Ignora
          </button>
        </div>
      )}

      {/* ── ROI Summary ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <RoiCard
          icon={<Clock className="w-4 h-4" />}
          label="Ore Fatturabili"
          value={`${totalBillable}h`}
          sub="tracciate su progetti clienti"
          color="text-accent-green-text bg-accent-green/10"
        />
        <RoiCard
          icon={<Euro className="w-4 h-4" />}
          label="Tariffa Media Reale"
          value={avgRate > 0 ? `€${avgRate}/h` : "—"}
          sub={avgRate >= 50 ? "Ottima! Sopra la media freelance" : avgRate > 0 ? "⚠ Sotto la media — alza i prezzi!" : "Registra ore per calcolare"}
          color={avgRate >= 50 ? "text-accent-green-text bg-accent-green/10" : avgRate > 0 ? "text-accent-orange-text bg-accent-orange/10" : "text-muted-foreground bg-muted"}
        />
        <RoiCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Tariffa Effettiva"
          value={effectiveRate > 0 ? `€${effectiveRate}/h` : "—"}
          sub="incluso overhead (fatturazione, ecc.)"
          color="text-blue-700 bg-blue-500/10"
        />
        <RoiCard
          icon={<HomeIcon className="w-4 h-4" />}
          label="Ore Overhead"
          value={`${totalOverhead}h`}
          sub="fatturazione, ricerca, studio"
          color="text-muted-foreground bg-muted"
        />
      </div>

      {/* ── Active Timer ── */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-5 h-5 text-accent-orange-text" />
          <h2 className="font-semibold text-foreground">Timer</h2>
          {timerRunning && (
            <Badge className="bg-accent-green/15 text-accent-green-text animate-pulse ml-1">● In corso</Badge>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Clock display */}
          <div className="font-mono text-4xl font-bold text-foreground bg-secondary rounded-xl px-6 py-3 tracking-widest shrink-0">
            {fmt(timerSecs)}
          </div>

          {/* Selectors */}
          <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
            <Select
              value={timerProjectId}
              onValueChange={(v) => { setTimerProjectId(v); setTimerTaskId(""); }}
              disabled={timerRunning}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Seleziona progetto…" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}{p.client !== "—" ? ` · ${p.client}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={timerTaskId}
              onValueChange={setTimerTaskId}
              disabled={!timerProjectId || timerRunning}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Seleziona task…" />
              </SelectTrigger>
              <SelectContent>
                {(timerProject?.tasks || []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {!timerRunning ? (
              <Button onClick={handleStartTimer} className="gradient-accent text-foreground font-semibold h-10 px-5">
                <Play className="w-4 h-4 mr-1.5" /> Avvia
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setTimerRunning(false)} className="h-10" title="Metti in pausa">
                  <Pause className="w-4 h-4" />
                </Button>
                <Button variant="destructive" onClick={handleStopTimer} className="h-10">
                  <Square className="w-4 h-4 mr-1.5" /> Stop & Salva
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Project list — Clienti ── */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Progetti Clienti (Fatturabili)
        </h2>
        {clientProjects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            expanded={expanded === p.id}
            onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
            onLogHours={() => { setLogProjectId(p.id); setLogOpen(true); }}
            onLinkPreventivo={() => { setLinkOpen(p.id); setLinkPreventivoId(""); }}
          />
        ))}
      </div>

      {/* ── Project list — Overhead ── */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Attività Interne (Costi & Investimento)
        </h2>
        {overheadProjects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            expanded={expanded === p.id}
            onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
            onLogHours={() => { setLogProjectId(p.id); setLogOpen(true); }}
            onLinkPreventivo={() => {}}
            isOverhead
          />
        ))}
      </div>

      {/* ════════════════ Dialogs ════════════════ */}

      {/* Log manual hours */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registra Ore Manualmente</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Select value={logProjectId} onValueChange={(v) => { setLogProjectId(v); setLogTaskId(""); }}>
              <SelectTrigger><SelectValue placeholder="Progetto…" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={logTaskId} onValueChange={setLogTaskId} disabled={!logProjectId}>
              <SelectTrigger><SelectValue placeholder="Task…" /></SelectTrigger>
              <SelectContent>
                {(projects.find((p) => p.id === logProjectId)?.tasks || []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Ore (es: 2.5)"
              value={logHours}
              onChange={(e) => setLogHours(e.target.value)}
              min="0.25"
              step="0.25"
            />
            <Input
              placeholder="Nota (opzionale)"
              value={logNote}
              onChange={(e) => setLogNote(e.target.value)}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setLogOpen(false)}>Annulla</Button>
            <Button
              onClick={handleLogManual}
              className="gradient-accent text-foreground font-semibold"
              disabled={!logProjectId || !logTaskId || !logHours}
            >
              Registra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link preventivo */}
      <Dialog open={!!linkOpen} onOpenChange={() => { setLinkOpen(null); setLinkPreventivoId(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collega Preventivo</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-1">
            Seleziona il preventivo da collegare. Il budget in ore definito nel preventivo diventerà il tetto massimo del progetto.
          </p>
          <div className="space-y-2 mt-3">
            {PREVENTIVI_MOCK.map((pr) => (
              <button
                key={pr.id}
                type="button"
                onClick={() => setLinkPreventivoId(pr.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors text-sm ${
                  linkPreventivoId === pr.id
                    ? "border-accent-green bg-accent-green/8 font-medium text-foreground"
                    : "border-border hover:bg-secondary text-muted-foreground"
                }`}
              >
                {linkPreventivoId === pr.id && (
                  <Check className="w-3 h-3 inline mr-2 text-accent-green-text" />
                )}
                {pr.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            I preventivi devono contenere il budget in ore per essere collegati a un progetto.
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setLinkOpen(null); setLinkPreventivoId(""); }}>Annulla</Button>
            <Button
              onClick={handleLinkPreventivo}
              className="gradient-accent text-foreground font-semibold"
              disabled={!linkPreventivoId}
            >
              Collega
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New project */}
      <Dialog open={newProjOpen} onOpenChange={setNewProjOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Progetto</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input
              placeholder="Nome progetto *"
              value={newProjName}
              onChange={(e) => setNewProjName(e.target.value)}
            />
            <Input
              placeholder="Cliente (opzionale)"
              value={newProjClient}
              onChange={(e) => setNewProjClient(e.target.value)}
            />
            <Select value={newProjType} onValueChange={(v) => setNewProjType(v as ProjectType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Progetto Cliente — fatturabile</SelectItem>
                <SelectItem value="overhead">Attività Interna — costo/investimento</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Budget ore * (es: 40)"
              value={newProjBudget}
              onChange={(e) => setNewProjBudget(e.target.value)}
              min="1"
            />
            {newProjType === "client" && (
              <Input
                type="number"
                placeholder="Valore progetto (€)"
                value={newProjValue}
                onChange={(e) => setNewProjValue(e.target.value)}
                min="0"
              />
            )}
            <Input
              placeholder="Nome primo task (opzionale)"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setNewProjOpen(false)}>Annulla</Button>
            <Button
              onClick={handleNewProject}
              className="gradient-accent text-foreground font-semibold"
              disabled={!newProjName || !newProjBudget}
            >
              Crea Progetto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoiCard({
  icon, label, value, sub, color,
}: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="p-4 rounded-xl bg-card shadow-card border border-border/50">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${color}`}>
        {icon}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold text-foreground mt-0.5">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{sub}</p>
    </div>
  );
}

function ProjectCard({
  project, expanded, onToggle, onLogHours, onLinkPreventivo, isOverhead,
}: {
  project: Project;
  expanded: boolean;
  onToggle: () => void;
  onLogHours: () => void;
  onLinkPreventivo: () => void;
  isOverhead?: boolean;
}) {
  const total = getTotalLogged(project);
  const pct = project.budgetHours > 0 ? Math.min(100, Math.round((total / project.budgetHours) * 100)) : 0;
  const overBudget = pct >= 100;
  const realRate = getRealRate(project);

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      {/* Header row */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/40 transition-colors"
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${project.color}`}>
          {isOverhead ? <HomeIcon className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-foreground truncate">{project.name}</span>
            {project.linkedPreventivo && (
              <Badge className="bg-accent-green/10 text-accent-green-text text-[10px] px-1.5">
                <Link2 className="w-2.5 h-2.5 mr-1" />PRV
              </Badge>
            )}
            {overBudget && (
              <Badge className="bg-destructive/15 text-destructive text-[10px] px-1.5">Over budget</Badge>
            )}
          </div>
          {project.client !== "—" && (
            <p className="text-xs text-muted-foreground mt-0.5">{project.client}</p>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-foreground">
              {total}h <span className="text-muted-foreground font-normal text-xs">/ {project.budgetHours}h</span>
            </p>
            {realRate && (
              <p className={`text-xs mt-0.5 font-medium ${realRate >= 50 ? "text-accent-green-text" : "text-accent-orange-text"}`}>
                €{realRate}/h reale
              </p>
            )}
          </div>
          {expanded
            ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
            : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-1 bg-muted mx-4 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            overBudget ? "bg-destructive" : pct > 75 ? "bg-accent-orange" : "bg-accent-green"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-3 border-t border-border/30 mt-1">
          {/* ROI insight (client only) */}
          {!isOverhead && realRate && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              realRate >= 50
                ? "bg-accent-green/8 border border-accent-green/20"
                : "bg-accent-orange/8 border border-accent-orange/20"
            }`}>
              <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${realRate >= 50 ? "text-accent-green-text" : "text-accent-orange-text"}`} />
              <span className={realRate >= 50 ? "text-accent-green-text" : "text-accent-orange-text"}>
                Hai fatturato <strong>€{project.value.toLocaleString("it-IT")}</strong> per questo progetto
                e tracciato <strong>{total}h</strong>.{" "}
                La tua tariffa reale è <strong>€{realRate}/h</strong>
                {realRate < 50
                  ? " — sotto la media freelance. Valuta di alzare i prezzi! 🚀"
                  : " — ottima performance! 💪"}
              </span>
            </div>
          )}

          {/* Tasks breakdown */}
          <div className="space-y-1">
            {project.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/40 text-sm"
              >
                <span className="text-foreground">{task.name}</span>
                <span className="font-mono text-muted-foreground text-xs font-medium">{task.hoursLogged}h</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <Button size="sm" variant="outline" onClick={onLogHours}>
              <Clock className="w-3.5 h-3.5 mr-1.5" /> Registra Ore
            </Button>
            {!isOverhead && (
              <Button size="sm" variant="outline" onClick={onLinkPreventivo}>
                <Link2 className="w-3.5 h-3.5 mr-1.5" />
                {project.linkedPreventivo ? "Cambia Preventivo" : "Collega Preventivo"}
              </Button>
            )}
            {project.value > 0 && (
              <span className="ml-auto text-xs text-muted-foreground font-medium">
                Valore: €{project.value.toLocaleString("it-IT")}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
