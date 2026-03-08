export type PreventivoStatus = "bozza" | "inviato" | "accettato" | "rifiutato";

export interface PreventivoVoce {
  id: string;
  descrizione: string;
  quantita: number;
  unita: "ore" | "giorni" | "pezzi" | "forfait";
  prezzoUnitario: number;
}

export interface Preventivo {
  id: string;
  numero: string;
  nomeProgetto: string;
  sottotitolo: string;
  nomeCliente: string;
  dataEmissione: string;
  dataValidita: string;
  stato: PreventivoStatus;
  brief: string;
  voci: PreventivoVoce[];
  ivaPercentuale: number;
  tempistiche: string;
  terminiCondizioni: string;
  logoFreelancer?: string;
  logoCliente?: string;
  logoCollaboratori: string[];
}

export const defaultTermini = `1. Il presente preventivo ha validità come indicato sopra dalla data di emissione.
2. I prezzi indicati sono da intendersi IVA esclusa, salvo diversa indicazione.
3. Il pagamento dovrà essere effettuato entro 30 giorni dalla data di fatturazione.
4. È richiesto un acconto del 30% all'accettazione del preventivo.
5. Eventuali modifiche al progetto dopo l'approvazione saranno oggetto di preventivo integrativo.
6. I tempi di consegna decorrono dalla data di ricezione di tutti i materiali necessari.
7. Il cliente si impegna a fornire feedback entro 5 giorni lavorativi dalla consegna di ciascuna fase.`;

export const mockPreventivi: Preventivo[] = [
  {
    id: "1",
    numero: "PRV-2026-001",
    nomeProgetto: "Restyling Sito Web",
    sottotitolo: "Preventivo",
    nomeCliente: "Mario Rossi SRL",
    dataEmissione: "2026-03-01",
    dataValidita: "2026-04-01",
    stato: "inviato",
    brief: "<p>Restyling completo del sito web aziendale con nuovo design responsive.</p>",
    voci: [
      { id: "v1", descrizione: "UX/UI Design", quantita: 5, unita: "giorni", prezzoUnitario: 350 },
      { id: "v2", descrizione: "Sviluppo Frontend", quantita: 40, unita: "ore", prezzoUnitario: 65 },
      { id: "v3", descrizione: "Testing & Deploy", quantita: 1, unita: "forfait", prezzoUnitario: 500 },
    ],
    ivaPercentuale: 22,
    tempistiche: "4 settimane a partire dall'approvazione",
    terminiCondizioni: defaultTermini,
    logoFreelancer: "",
    logoCliente: "",
    logoCollaboratori: [],
  },
  {
    id: "2",
    numero: "PRV-2026-002",
    nomeProgetto: "App Mobile E-commerce",
    sottotitolo: "Preventivo",
    nomeCliente: "Fashion Store Italia",
    dataEmissione: "2026-02-15",
    dataValidita: "2026-03-15",
    stato: "accettato",
    brief: "<p>Sviluppo app mobile per e-commerce con integrazione pagamenti.</p>",
    voci: [
      { id: "v1", descrizione: "Analisi e Wireframe", quantita: 3, unita: "giorni", prezzoUnitario: 400 },
      { id: "v2", descrizione: "Sviluppo App", quantita: 120, unita: "ore", prezzoUnitario: 70 },
      { id: "v3", descrizione: "Integrazione API", quantita: 20, unita: "ore", prezzoUnitario: 75 },
    ],
    ivaPercentuale: 22,
    tempistiche: "8 settimane",
    terminiCondizioni: defaultTermini,
    logoFreelancer: "",
    logoCliente: "",
    logoCollaboratori: [],
  },
  {
    id: "3",
    numero: "PRV-2026-003",
    nomeProgetto: "Brand Identity",
    sottotitolo: "Preventivo",
    nomeCliente: "Startup Innovativa",
    dataEmissione: "2026-03-05",
    dataValidita: "2026-04-05",
    stato: "bozza",
    brief: "<p>Creazione completa brand identity: logo, palette colori, tipografia, brand guidelines.</p>",
    voci: [
      { id: "v1", descrizione: "Ricerca e Moodboard", quantita: 2, unita: "giorni", prezzoUnitario: 300 },
      { id: "v2", descrizione: "Design Logo (3 proposte)", quantita: 1, unita: "forfait", prezzoUnitario: 1500 },
      { id: "v3", descrizione: "Brand Guidelines", quantita: 1, unita: "forfait", prezzoUnitario: 800 },
    ],
    ivaPercentuale: 0,
    tempistiche: "3 settimane",
    terminiCondizioni: defaultTermini,
    logoFreelancer: "",
    logoCliente: "",
    logoCollaboratori: [],
  },
];
