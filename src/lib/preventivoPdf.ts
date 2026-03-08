import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Preventivo } from "@/types/preventivo";

// ── Solvy Design System Colors ──
const ACID_GREEN: [number, number, number] = [170, 255, 69];   // #AAFF45
const ORANGE: [number, number, number] = [255, 107, 26];       // #FF6B1A
const DARK: [number, number, number] = [33, 33, 33];           // foreground
const MUTED: [number, number, number] = [115, 115, 115];       // muted-foreground
const LIGHT_MUTED: [number, number, number] = [180, 180, 180];
const BG_SUBTLE: [number, number, number] = [250, 250, 250];   // secondary bg
const WHITE: [number, number, number] = [255, 255, 255];

// ── Gradient bar (green → orange) ──
function gradientBar(doc: jsPDF, x: number, y: number, w: number, h: number) {
  const steps = 30;
  const sw = w / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    doc.setFillColor(
      ACID_GREEN[0] + (ORANGE[0] - ACID_GREEN[0]) * t,
      ACID_GREEN[1] + (ORANGE[1] - ACID_GREEN[1]) * t,
      ACID_GREEN[2] + (ORANGE[2] - ACID_GREEN[2]) * t,
    );
    doc.rect(x + i * sw, y, sw + 0.5, h, "F");
  }
}

// ── Soft corner glow ──
function cornerGlow(doc: jsPDF, pw: number, ph: number) {
  const steps = 25;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const r = ACID_GREEN[0] + (ORANGE[0] - ACID_GREEN[0]) * t;
    const g = ACID_GREEN[1] + (ORANGE[1] - ACID_GREEN[1]) * t;
    const b = ACID_GREEN[2] + (ORANGE[2] - ACID_GREEN[2]) * t;
    doc.setFillColor(r, g, b);
    doc.setGState(doc.GState({ opacity: 0.04 + t * 0.03 }));
    const radius = 140 - (140 * i) / steps;
    doc.circle(pw + 20, ph + 20, radius, "F");
  }
  doc.setGState(doc.GState({ opacity: 1 }));
}

function addLogo(doc: jsPDF, dataUrl: string, x: number, y: number, maxW: number, maxH: number) {
  if (!dataUrl) return;
  try { doc.addImage(dataUrl, "PNG", x, y, maxW, maxH); } catch { /* skip */ }
}

// ── Accent line (gradient) ──
function accentLineGradient(doc: jsPDF, x: number, y: number, w: number, h = 1.8) {
  gradientBar(doc, x, y, w, h);
}

export function generatePDF(p: Preventivo) {
  const doc = new jsPDF("l", "mm", "a4");
  const pw = 297;
  const ph = 210;
  const ml = 28;
  const mr = 28;
  const cw = pw - ml - mr;

  // ═══════════════════════════════════════════
  //  PAGE 1 — COVER
  // ═══════════════════════════════════════════
  
  // Top gradient bar
  gradientBar(doc, 0, 0, pw, 4);
  
  // Corner glow
  cornerGlow(doc, pw, ph);

  // Client logo top-left
  if (p.logoCliente) addLogo(doc, p.logoCliente, ml, 16, 32, 22);

  // Freelancer logo top-right
  if (p.logoFreelancer) addLogo(doc, p.logoFreelancer, pw - mr - 28, 16, 28, 22);

  // "PREVENTIVO" spaced label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(4);
  doc.text("PREVENTIVO", ml, 75);
  doc.setCharSpace(0);

  // Accent line under label
  accentLineGradient(doc, ml, 79, 55);

  // Project name — big, bold, high contrast
  doc.setFont("helvetica", "bold");
  doc.setFontSize(38);
  doc.setTextColor(...DARK);
  const titleLines = doc.splitTextToSize(p.nomeProgetto, pw * 0.55);
  doc.text(titleLines, ml, 96);

  // Subtitle
  const titleEndY = 96 + titleLines.length * 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(...MUTED);
  doc.text(p.sottotitolo || "", ml, titleEndY + 4);

  // ── Bottom section ──
  const botY = ph - 32;

  // Client info — left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text(p.nomeCliente, ml, botY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`N° ${p.numero}  ·  ${new Date(p.dataEmissione).toLocaleDateString("it-IT")}`, ml, botY + 6);

  // Freelancer label — right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Validità fino al ${new Date(p.dataValidita).toLocaleDateString("it-IT")}`, pw - mr, botY + 6, { align: "right" });

  // Collaborator logos centered
  if (p.logoCollaboratori.length > 0) {
    const logoW = 18;
    const gap = 6;
    const totalW = p.logoCollaboratori.length * logoW + (p.logoCollaboratori.length - 1) * gap;
    let sx = (pw - totalW) / 2;
    p.logoCollaboratori.forEach((logo) => {
      addLogo(doc, logo, sx, ph - 58, logoW, logoW);
      sx += logoW + gap;
    });
  }

  // Bottom gradient bar
  gradientBar(doc, 0, ph - 4, pw, 4);

  // ═══════════════════════════════════════════
  //  PAGE 2 — ATTIVITÀ / PRICING
  // ═══════════════════════════════════════════
  doc.addPage();
  gradientBar(doc, 0, 0, pw, 3);
  cornerGlow(doc, pw, ph);

  // Page label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(52);
  doc.setTextColor(240, 240, 240);
  doc.text("02", pw - mr, 28, { align: "right" });

  // Header
  accentLineGradient(doc, ml, 18, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...DARK);
  doc.text("Attività", ml, 30);

  // ── Table ──
  const unitaMap: Record<string, string> = { ore: "ora", giorni: "giorno", pezzi: "pz", forfait: "forfait" };

  autoTable(doc, {
    startY: 40,
    margin: { left: ml, right: mr },
    head: [["Descrizione", "Qtà", "Unità", "Costo"]],
    body: p.voci.map((v) => [
      v.descrizione,
      v.unita === "forfait" ? "—" : String(v.quantita),
      unitaMap[v.unita] || v.unita,
      `€ ${v.prezzoUnitario.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`,
    ]),
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: { top: 6, bottom: 6, left: 8, right: 8 },
      textColor: [...DARK] as [number, number, number],
      lineColor: [232, 232, 232],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [...DARK] as [number, number, number],
      textColor: [...WHITE] as [number, number, number],
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [...BG_SUBTLE] as [number, number, number],
    },
    columnStyles: {
      0: { cellWidth: cw * 0.55 },
      1: { cellWidth: cw * 0.10, halign: "center" },
      2: { cellWidth: cw * 0.15, halign: "center" },
      3: { cellWidth: cw * 0.20, halign: "right", fontStyle: "bold" },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 100;

  // ── Totals ──
  const subtotal = p.voci.reduce((s, v) => s + v.quantita * v.prezzoUnitario, 0);
  const iva = subtotal * (p.ivaPercentuale / 100);
  const total = subtotal + iva;

  let ty = finalY + 6;

  // Subtotal + IVA lines
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text("Subtotale", pw - mr - 70, ty);
  doc.text(`€ ${subtotal.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`, pw - mr, ty, { align: "right" });

  if (p.ivaPercentuale > 0) {
    ty += 6;
    doc.text(`IVA ${p.ivaPercentuale}%`, pw - mr - 70, ty);
    doc.text(`€ ${iva.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`, pw - mr, ty, { align: "right" });
  }

  // Total with gradient background
  ty += 10;
  gradientBar(doc, pw - mr - 80, ty - 5, 80, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text("TOTALE", pw - mr - 74, ty + 4);
  doc.text(`€ ${total.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`, pw - mr - 4, ty + 4, { align: "right" });

  // IVA excluded note
  ty += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...LIGHT_MUTED);
  doc.text(p.ivaPercentuale > 0 ? "Importi IVA inclusa." : "IVA esclusa.", pw - mr, ty, { align: "right" });

  // ── Two columns: Tempistiche & Condizioni pagamento ──
  const colY = Math.max(ty + 12, finalY + 55);
  const colW = cw / 2 - 15;

  if (p.tempistiche) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    doc.text("Tempistiche", ml, colY);
    accentLineGradient(doc, ml, colY + 2, 30, 1);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const tLines = doc.splitTextToSize(p.tempistiche, colW);
    doc.text(tLines, ml, colY + 9);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Condizioni di pagamento", ml + colW + 30, colY);
  accentLineGradient(doc, ml + colW + 30, colY + 2, 30, 1);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const payLines = doc.splitTextToSize(
    "Pagamento tramite bonifico bancario entro 30 giorni dalla data di emissione della fattura.",
    colW
  );
  doc.text(payLines, ml + colW + 30, colY + 9);

  // Signature bottom right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text("Cordiali saluti,", pw - mr, ph - 28, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text(p.sottotitolo || "Il Freelancer", pw - mr, ph - 21, { align: "right" });

  gradientBar(doc, 0, ph - 3, pw, 3);

  // ═══════════════════════════════════════════
  //  PAGE 3 — TERMINI E CONDIZIONI
  // ═══════════════════════════════════════════
  doc.addPage();
  gradientBar(doc, 0, 0, pw, 3);

  // Big faded page number
  doc.setFont("helvetica", "bold");
  doc.setFontSize(56);
  doc.setTextColor(235, 235, 235);
  doc.text("03", pw - mr, 32, { align: "right" });

  // Header
  accentLineGradient(doc, ml, 18, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...DARK);
  doc.text("T&C", ml, 30);

  // Side label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...LIGHT_MUTED);
  doc.setCharSpace(2);
  doc.text("TERMINI E", ml, 46);
  doc.text("CONDIZIONI", ml, 51);
  doc.setCharSpace(0);

  // Terms content — numbered, justified feel
  const tcX = ml + 52;
  const tcW = cw - 52;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);

  const rawTerms = p.terminiCondizioni.trim();
  const termItems = rawTerms.split(/\n/).filter(l => l.trim().length > 0);

  let tcY = 46;
  termItems.forEach((item) => {
    const clean = item.trim();
    const lines = doc.splitTextToSize(clean, tcW);
    if (tcY + lines.length * 4.2 > ph - 38) return;
    doc.text(lines, tcX, tcY);
    tcY += lines.length * 4.2 + 3.5;
  });

  // Closing
  tcY += 8;
  if (tcY < ph - 50) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("Grazie per la tua considerazione. Sarà un piacere lavorare insieme!", tcX, tcY);
    doc.text("Resto a disposizione per eventuali domande o chiarimenti.", tcX, tcY + 5);
  }

  // ── Footer ──
  const footY = ph - 20;
  gradientBar(doc, ml, footY, cw, 0.8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text(p.sottotitolo || "Freelancer", ml, footY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  const fItems = [
    `N° ${p.numero}`,
    new Date(p.dataEmissione).toLocaleDateString("it-IT"),
    p.nomeCliente,
    p.nomeProgetto,
  ];
  const fSpacing = (cw - 60) / fItems.length;
  fItems.forEach((item, i) => {
    doc.text(item, ml + 60 + fSpacing * i, footY + 7);
  });

  gradientBar(doc, 0, ph - 3, pw, 3);

  // ── Signature lines ──
  const sigY = ph - 32;
  doc.setDrawColor(...LIGHT_MUTED);
  doc.setLineWidth(0.3);
  doc.line(ml, sigY, ml + 60, sigY);
  doc.line(pw - mr - 60, sigY, pw - mr, sigY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text("Il Freelancer", ml, sigY + 4);
  doc.text("Il Cliente", pw - mr - 60, sigY + 4);

  // ── Download ──
  doc.save(`${p.numero}_${p.nomeProgetto.replace(/\s+/g, "_")}.pdf`);
}
