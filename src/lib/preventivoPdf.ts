import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Preventivo } from "@/types/preventivo";

// ── Solvy Design System ──
const DEFAULT_GREEN: [number, number, number] = [170, 255, 69];
const DEFAULT_ORANGE: [number, number, number] = [255, 107, 26];
const DARK: [number, number, number] = [33, 33, 33];
const MUTED: [number, number, number] = [115, 115, 115];
const SOFT: [number, number, number] = [200, 200, 200];
const BG: [number, number, number] = [252, 252, 252];
const WHITE: [number, number, number] = [255, 255, 255];

export interface PdfColors {
  colorStart: string; // hex
  colorEnd: string;   // hex
  mode: "gradient" | "colorful";
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

let COLOR_START: [number, number, number] = DEFAULT_GREEN;
let COLOR_END: [number, number, number] = DEFAULT_ORANGE;

function gradient(doc: jsPDF, x: number, y: number, w: number, h: number) {
  const steps = 30;
  const sw = w / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    doc.setFillColor(
      COLOR_START[0] + (COLOR_END[0] - COLOR_START[0]) * t,
      COLOR_START[1] + (COLOR_END[1] - COLOR_START[1]) * t,
      COLOR_START[2] + (COLOR_END[2] - COLOR_START[2]) * t,
    );
    doc.rect(x + i * sw, y, sw + 0.5, h, "F");
  }
}

function glow(doc: jsPDF, pw: number, ph: number) {
  for (let i = 0; i < 20; i++) {
    const t = i / 20;
    doc.setFillColor(
      GREEN[0] + (ORANGE[0] - GREEN[0]) * t,
      GREEN[1] + (ORANGE[1] - GREEN[1]) * t,
      GREEN[2] + (ORANGE[2] - GREEN[2]) * t,
    );
    doc.setGState(doc.GState({ opacity: 0.035 + t * 0.025 }));
    doc.circle(pw + 15, ph + 15, 130 - i * 6, "F");
  }
  doc.setGState(doc.GState({ opacity: 1 }));
}

function logo(doc: jsPDF, dataUrl: string, x: number, y: number, w: number, h: number) {
  if (!dataUrl) return;
  try { doc.addImage(dataUrl, "PNG", x, y, w, h); } catch { /* */ }
}

// Rounded rect helper (simulated card feel)
function card(doc: jsPDF, x: number, y: number, w: number, h: number, r = 4) {
  doc.setFillColor(...BG);
  doc.roundedRect(x, y, w, h, r, r, "F");
}

export function generatePDF(p: Preventivo) {
  const doc = new jsPDF("l", "mm", "a4");
  const pw = 297;
  const ph = 210;
  const m = 24;
  const cw = pw - m * 2;

  // ═══════════════════════════════════════════
  //  PAGE 1 — COVER
  // ═══════════════════════════════════════════
  gradient(doc, 0, 0, pw, 5);
  glow(doc, pw, ph);

  // Logos
  if (p.logoCliente) logo(doc, p.logoCliente, m, 20, 36, 26);
  if (p.logoFreelancer) logo(doc, p.logoFreelancer, pw - m - 34, 20, 34, 26);

  // "PREVENTIVO" — big spaced label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(6);
  doc.text("PREVENTIVO", m, 78);
  doc.setCharSpace(0);

  // Gradient accent under label
  gradient(doc, m, 82, 65, 2.5);

  // Project name — HUGE bold
  doc.setFont("helvetica", "bold");
  doc.setFontSize(46);
  doc.setTextColor(...DARK);
  const title = doc.splitTextToSize(p.nomeProgetto, pw * 0.6);
  doc.text(title, m, 104);

  // Subtitle
  const titleEnd = 104 + title.length * 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(18);
  doc.setTextColor(...MUTED);
  doc.text(p.sottotitolo || "", m, titleEnd + 4);

  // ── Bottom info bar ──
  const by = ph - 28;
  
  // Left — client
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...DARK);
  doc.text(p.nomeCliente, m, by);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text(`N° ${p.numero}  ·  ${new Date(p.dataEmissione).toLocaleDateString("it-IT")}`, m, by + 7);

  // Right — validity
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text(`Valido fino al ${new Date(p.dataValidita).toLocaleDateString("it-IT")}`, pw - m, by + 7, { align: "right" });

  // Collaborators
  if (p.logoCollaboratori.length > 0) {
    const lw = 20, gap = 8;
    const tw = p.logoCollaboratori.length * lw + (p.logoCollaboratori.length - 1) * gap;
    let sx = (pw - tw) / 2;
    p.logoCollaboratori.forEach((l) => { logo(doc, l, sx, ph - 62, lw, lw); sx += lw + gap; });
  }

  gradient(doc, 0, ph - 5, pw, 5);

  // ═══════════════════════════════════════════
  //  PAGE 2 — ATTIVITÀ
  // ═══════════════════════════════════════════
  doc.addPage();
  gradient(doc, 0, 0, pw, 4);
  glow(doc, pw, ph);

  // Ghost page number
  doc.setFont("helvetica", "bold");
  doc.setFontSize(72);
  doc.setTextColor(242, 242, 242);
  doc.text("02", pw - m, 38, { align: "right" });

  // Title
  gradient(doc, m, 16, 55, 2.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...DARK);
  doc.text("Attività", m, 32);

  // ── Table ──
  const uMap: Record<string, string> = { ore: "ora", giorni: "giorno", pezzi: "pz", forfait: "forfait" };

  autoTable(doc, {
    startY: 44,
    margin: { left: m, right: m },
    head: [["Descrizione", "Qtà", "Unità", "Prezzo"]],
    body: p.voci.map((v) => [
      v.descrizione,
      v.unita === "forfait" ? "—" : String(v.quantita),
      uMap[v.unita] || v.unita,
      `€ ${v.prezzoUnitario.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`,
    ]),
    styles: {
      font: "helvetica",
      fontSize: 11,
      cellPadding: { top: 7, bottom: 7, left: 10, right: 10 },
      textColor: [...DARK],
      lineColor: [235, 235, 235],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [...DARK],
      textColor: [...WHITE],
      fontStyle: "bold",
      fontSize: 10,
    },
    alternateRowStyles: { fillColor: [...BG] },
    columnStyles: {
      0: { cellWidth: cw * 0.52 },
      1: { cellWidth: cw * 0.12, halign: "center" },
      2: { cellWidth: cw * 0.16, halign: "center" },
      3: { cellWidth: cw * 0.20, halign: "right", fontStyle: "bold" },
    },
  });

  const fy = (doc as any).lastAutoTable?.finalY || 100;

  // ── Totals ──
  const sub = p.voci.reduce((s, v) => s + v.quantita * v.prezzoUnitario, 0);
  const iva = sub * (p.ivaPercentuale / 100);
  const tot = sub + iva;

  let ty = fy + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...MUTED);
  doc.text("Subtotale", pw - m - 80, ty);
  doc.text(`€ ${sub.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`, pw - m, ty, { align: "right" });

  if (p.ivaPercentuale > 0) {
    ty += 8;
    doc.text(`IVA ${p.ivaPercentuale}%`, pw - m - 80, ty);
    doc.text(`€ ${iva.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`, pw - m, ty, { align: "right" });
  }

  // Total pill with gradient
  ty += 14;
  gradient(doc, pw - m - 90, ty - 7, 90, 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text("TOTALE", pw - m - 84, ty + 3);
  doc.text(`€ ${tot.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`, pw - m - 5, ty + 3, { align: "right" });

  ty += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SOFT);
  doc.text(p.ivaPercentuale > 0 ? "Importi IVA inclusa" : "IVA esclusa", pw - m, ty, { align: "right" });

  // ── Info cards ──
  const cardY = Math.max(ty + 14, fy + 62);
  const cardW = cw / 2 - 12;

  if (p.tempistiche) {
    card(doc, m, cardY, cardW, 28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text("Tempistiche", m + 10, cardY + 10);
    gradient(doc, m + 10, cardY + 13, 28, 1.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const tl = doc.splitTextToSize(p.tempistiche, cardW - 20);
    doc.text(tl, m + 10, cardY + 22);
  }

  card(doc, m + cardW + 24, cardY, cardW, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text("Pagamento", m + cardW + 34, cardY + 10);
  gradient(doc, m + cardW + 34, cardY + 13, 28, 1.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const pl = doc.splitTextToSize("Bonifico bancario entro 30gg dalla data di fatturazione.", cardW - 20);
  doc.text(pl, m + cardW + 34, cardY + 22);

  // Signature
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...MUTED);
  doc.text("Cordiali saluti,", pw - m, ph - 22, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text(p.sottotitolo || "Il Freelancer", pw - m, ph - 14, { align: "right" });

  gradient(doc, 0, ph - 4, pw, 4);

  // ═══════════════════════════════════════════
  //  PAGE 3 — T&C
  // ═══════════════════════════════════════════
  doc.addPage();
  gradient(doc, 0, 0, pw, 4);

  // Ghost page number
  doc.setFont("helvetica", "bold");
  doc.setFontSize(72);
  doc.setTextColor(242, 242, 242);
  doc.text("03", pw - m, 38, { align: "right" });

  // Title
  gradient(doc, m, 16, 55, 2.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...DARK);
  doc.text("Termini e Condizioni", m, 32);

  // Terms inside a card-like area
  const tcX = m + 8;
  const tcW = cw - 16;
  card(doc, m, 42, cw, ph - 80);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(60, 60, 60);

  const items = p.terminiCondizioni.trim().split(/\n/).filter(l => l.trim());
  let tcY = 54;
  items.forEach((item) => {
    const lines = doc.splitTextToSize(item.trim(), tcW - 16);
    if (tcY + lines.length * 5 > ph - 46) return;
    doc.text(lines, tcX + 8, tcY);
    tcY += lines.length * 5 + 4;
  });

  // Closing message
  tcY += 6;
  if (tcY < ph - 52) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text("Grazie per la tua considerazione!", tcX + 8, tcY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text("Resto a disposizione per eventuali domande o chiarimenti.", tcX + 8, tcY + 6);
  }

  // ── Signature block ──
  const sigY = ph - 30;
  doc.setDrawColor(...SOFT);
  doc.setLineWidth(0.4);
  doc.line(m, sigY, m + 65, sigY);
  doc.line(pw - m - 65, sigY, pw - m, sigY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text("Il Freelancer", m, sigY + 5);
  doc.text("Il Cliente", pw - m - 65, sigY + 5);

  // Footer
  gradient(doc, m, ph - 16, cw, 1);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`${p.sottotitolo || "Freelancer"}  ·  N° ${p.numero}  ·  ${new Date(p.dataEmissione).toLocaleDateString("it-IT")}  ·  ${p.nomeCliente}`, pw / 2, ph - 10, { align: "center" });

  gradient(doc, 0, ph - 4, pw, 4);

  // ── Save ──
  doc.save(`${p.numero}_${p.nomeProgetto.replace(/\s+/g, "_")}.pdf`);
}
