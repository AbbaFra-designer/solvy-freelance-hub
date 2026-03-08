export type SourceType = "rss" | "page";

export interface BandiSource {
  id: string;
  name: string;
  url: string;
  type: SourceType;
  category: string;
  enabled: boolean;
  description: string;
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
  { id: "mimit", name: "MIMIT – Incentivi", url: "https://www.mimit.gov.it/it/rss/incentivi", type: "rss", category: "Governo", enabled: true, description: "Incentivi e agevolazioni dal Ministero delle Imprese e del Made in Italy per PMI, startup e professionisti." },
  { id: "eu-funding", name: "EU Funding & Tenders", url: "https://ec.europa.eu/info/funding-tenders/rss", type: "rss", category: "Europa", enabled: true, description: "Bandi europei per finanziamenti, ricerca e innovazione. Include Horizon Europe, Creative Europe e altri programmi UE." },

  // ── Pagine da scraping ──
  { id: "invitalia", name: "Invitalia", url: "https://www.invitalia.it/cosa-facciamo", type: "page", category: "Governo", enabled: true, description: "Agenzia nazionale per l'attrazione degli investimenti. Gestisce incentivi per nuove imprese, startup e freelance in Italia." },
  { id: "europa-creativa", name: "Europa Creativa", url: "https://europacreativa.cultura.gov.it", type: "page", category: "Europa", enabled: true, description: "Programma UE per i settori culturali e creativi: design, architettura, arti visive, audiovisivo. Finanziamenti fino a 200k€." },
  { id: "artes4", name: "ARTES 4.0", url: "https://www.artes4.it/bandi/", type: "page", category: "Innovazione", enabled: true, description: "Centro di competenza per l'Industria 4.0. Bandi per innovazione tecnologica, digitalizzazione e trasformazione digitale delle PMI." },
  { id: "made-cc", name: "MADE Competence Center", url: "https://www.made-cc.eu", type: "page", category: "Innovazione", enabled: true, description: "Competence Center per l'Industria 4.0 a Milano. Voucher e finanziamenti per progetti di digitalizzazione e innovazione." },
  { id: "contributi-regione", name: "Contributi Regione I4.0", url: "https://bandi.contributiregione.it/categoria/industria-4", type: "page", category: "Regionale", enabled: true, description: "Raccolta di bandi regionali per Industria 4.0: digitalizzazione, e-commerce, marketing digitale per PMI e professionisti." },
  { id: "europafacile", name: "EuropaFacile", url: "https://www.europafacile.net/bandi/", type: "page", category: "Europa", enabled: true, description: "Portale italiano con tutti i bandi europei attivi. Filtri per settore: creatività, digitale, innovazione, PMI." },
  { id: "sprintx", name: "SprintX Digitalizzazione", url: "https://sprintx.it/blog/bandi-digitalizzazione/", type: "page", category: "Innovazione", enabled: true, description: "Guide aggiornate sui bandi per la digitalizzazione delle imprese italiane: voucher digitali, credito d'imposta 4.0." },
  { id: "pa-digitale", name: "PA Digitale 2026", url: "https://padigitale2026.gov.it", type: "page", category: "Governo", enabled: true, description: "Avvisi PNRR per la transizione digitale della PA. Opportunità per fornitori di servizi digitali, UX e design." },

  // ── Concorsi & Design ──
  { id: "adi-index", name: "ADI Design Index", url: "https://www.adi-design.org/adi-design-index.html", type: "page", category: "Design & Premi", enabled: true, description: "Selezione annuale dei migliori prodotti di design italiano. Candidature aperte per designer e studi di progettazione." },
  { id: "ux-design-awards", name: "UX Design Awards", url: "https://ux-design-awards.com/en/submissions", type: "page", category: "Design & Premi", enabled: true, description: "Premio internazionale per eccellenza in UX/UI design. Categorie: Product, Concept, New Talent. Deadline annuale." },
  { id: "if-design", name: "iF Design Award", url: "https://ifdesign.com/en/if-design-award", type: "page", category: "Design & Premi", enabled: true, description: "Uno dei premi di design più prestigiosi al mondo. Categorie: Communication, Product, UX, Architecture, Interior." },
  { id: "red-dot", name: "Red Dot Design Award", url: "https://www.red-dot.org/about-red-dot/competitions", type: "page", category: "Design & Premi", enabled: true, description: "Premio internazionale per Product Design, Brands & Communication, e Design Concept. Riconoscimento globale." },
  { id: "awwwards", name: "Awwwards", url: "https://www.awwwards.com/websites/sites-of-the-day/", type: "page", category: "Design & Premi", enabled: true, description: "Piattaforma per il riconoscimento del web design. Premi: Site of the Day, Developer Award, Honorable Mention." },
  { id: "a-design", name: "A' Design Award", url: "https://competition.adesignaward.com/registration.php", type: "page", category: "Design & Premi", enabled: true, description: "Concorso internazionale di design con 100+ categorie. Aperto a freelance, studi e aziende. Scadenze semestrali." },
  { id: "european-design", name: "European Design Awards", url: "https://europeandesign.org", type: "page", category: "Design & Premi", enabled: true, description: "Premi per il miglior design europeo in grafica, digital, editorial, branding e interaction design." },

  // ── Mezzogiorno / Resto al Sud ──
  { id: "resto-al-sud", name: "Resto al Sud – Invitalia", url: "https://www.invitalia.it/cosa-facciamo/creo-nuova-impresa/resto-al-sud", type: "page", category: "Mezzogiorno", enabled: true, description: "Finanziamento fino a 200.000€ per under 56 che avviano attività nel Sud Italia. Copre fino al 100% dell'investimento." },
  { id: "decontribuzione-sud", name: "Decontribuzione Sud", url: "https://www.invitalia.it/cosa-facciamo/rafforzo-impresa/decontribuzione-sud", type: "page", category: "Mezzogiorno", enabled: true, description: "Esonero contributivo fino al 30% per assunzioni nel Mezzogiorno. Valido per imprese e liberi professionisti." },
  { id: "zes-unica", name: "ZES Unica Mezzogiorno", url: "https://www.agenziacoesione.gov.it/zes-zona-economica-speciale/", type: "page", category: "Mezzogiorno", enabled: true, description: "Credito d'imposta per investimenti nelle Zone Economiche Speciali del Sud. Agevolazioni fiscali per nuove attività." },

  // ── Startup / PMI ──
  { id: "smart-start", name: "Smart&Start Italia", url: "https://www.invitalia.it/cosa-facciamo/creo-nuova-impresa/smartstart-italia", type: "page", category: "Startup", enabled: true, description: "Finanziamento a tasso zero fino a 1,5 milioni per startup innovative. Copre fino all'80% delle spese ammissibili." },
  { id: "nuove-imprese", name: "Nuove Imprese a Tasso Zero", url: "https://www.invitalia.it/cosa-facciamo/creo-nuova-impresa/nuove-imprese-a-tasso-zero", type: "page", category: "Startup", enabled: true, description: "Finanziamenti agevolati per under 36 e donne che creano nuove imprese. Fino a 1,5 milioni a tasso zero." },
  { id: "cultura-crea", name: "Cultura Crea Plus", url: "https://www.invitalia.it/cosa-facciamo/creo-nuova-impresa/cultura-crea", type: "page", category: "Mezzogiorno", enabled: true, description: "Incentivi per imprese culturali e creative nel Mezzogiorno: design, comunicazione, audiovisivo. Fondo perduto fino al 80%." },
  { id: "selfiemployment", name: "SELFIEmployment", url: "https://www.invitalia.it/cosa-facciamo/creo-nuova-impresa/selfiemployment", type: "page", category: "Startup", enabled: true, description: "Prestiti a tasso zero per giovani NEET che vogliono avviare un'attività. Da 5.000€ a 50.000€ senza garanzie." },
];

export type RefreshFrequency = "on_open" | "every_6h" | "every_24h";
