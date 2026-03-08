export type SourceType = "rss" | "page";

export interface BandiSource {
  id: string;
  name: string;
  url: string;
  type: SourceType;
  category: string;
  enabled: boolean;
}

export const BANDI_KEYWORDS = [
  "design", "designer", "freelance", "digitale", "innovazione",
  "industria 4.0", "trasformazione digitale", "creativi", "PMI",
  "comunicazione visiva", "UX", "progettazione", "startup",
  "imprese giovanili", "mezzogiorno", "sud", "finanziamento",
  "bando", "sovvenzione", "contributo", "fondo perduto",
];

export const DEFAULT_SOURCES: BandiSource[] = [
  // ── RSS feeds ──
  { id: "mimit", name: "MIMIT – Incentivi", url: "https://www.mimit.gov.it/it/rss/incentivi", type: "rss", category: "Governo", enabled: true },
  { id: "eu-funding", name: "EU Funding & Tenders", url: "https://ec.europa.eu/info/funding-tenders/rss", type: "rss", category: "Europa", enabled: true },

  // ── Pagine da scraping ──
  { id: "invitalia", name: "Invitalia", url: "https://www.invitalia.it/cosa-facciamo", type: "page", category: "Governo", enabled: true },
  { id: "europa-creativa", name: "Europa Creativa", url: "https://europacreativa.cultura.gov.it", type: "page", category: "Europa", enabled: true },
  { id: "artes4", name: "ARTES 4.0", url: "https://www.artes4.it/bandi/", type: "page", category: "Innovazione", enabled: true },
  { id: "made-cc", name: "MADE Competence Center", url: "https://www.made-cc.eu", type: "page", category: "Innovazione", enabled: true },
  { id: "contributi-regione", name: "Contributi Regione I4.0", url: "https://bandi.contributiregione.it/categoria/industria-4", type: "page", category: "Regionale", enabled: true },
  { id: "europafacile", name: "EuropaFacile", url: "https://www.europafacile.net/bandi/", type: "page", category: "Europa", enabled: true },
  { id: "sprintx", name: "SprintX Digitalizzazione", url: "https://sprintx.it/blog/bandi-digitalizzazione/", type: "page", category: "Innovazione", enabled: true },
  { id: "pa-digitale", name: "PA Digitale 2026", url: "https://padigitale2026.gov.it", type: "page", category: "Governo", enabled: true },

  // ── Concorsi & Design ──
  { id: "adi-index", name: "ADI Design Index", url: "https://www.adi-design.org/adi-design-index.html", type: "page", category: "Design & Premi", enabled: true },
  { id: "ux-design-awards", name: "UX Design Awards", url: "https://ux-design-awards.com/en/submissions", type: "page", category: "Design & Premi", enabled: true },
  { id: "if-design", name: "iF Design Award", url: "https://ifdesignasia.com/award-discipline/", type: "page", category: "Design & Premi", enabled: true },
  { id: "red-dot", name: "Red Dot Design Award", url: "https://www.red-dot.org/about-red-dot/competitions", type: "page", category: "Design & Premi", enabled: true },
  { id: "awwwards", name: "Awwwards – Submissions", url: "https://www.awwwards.com/websites/sites-of-the-day/", type: "page", category: "Design & Premi", enabled: true },

  // ── Mezzogiorno / Resto al Sud ──
  { id: "resto-al-sud", name: "Resto al Sud – Invitalia", url: "https://www.invitalia.it/cosa-facciamo/creo-nuova-impresa/resto-al-sud", type: "page", category: "Mezzogiorno", enabled: true },
  { id: "decontribuzione-sud", name: "Decontribuzione Sud", url: "https://www.invitalia.it/cosa-facciamo/rafforzo-impresa/decontribuzione-sud", type: "page", category: "Mezzogiorno", enabled: true },
  { id: "zes-unica", name: "ZES Unica Mezzogiorno", url: "https://www.agenziacoesione.gov.it/zes-zona-economica-speciale/", type: "page", category: "Mezzogiorno", enabled: true },

  // ── Startup / PMI ──
  { id: "smart-start", name: "Smart&Start Italia", url: "https://www.invitalia.it/cosa-facciamo/creo-nuova-impresa/smartstart-italia", type: "page", category: "Startup", enabled: true },
  { id: "nuove-imprese", name: "Nuove Imprese a Tasso Zero", url: "https://www.invitalia.it/cosa-facciamo/creo-nuova-impresa/nuove-imprese-a-tasso-zero", type: "page", category: "Startup", enabled: true },
];

export type RefreshFrequency = "on_open" | "every_6h" | "every_24h";
