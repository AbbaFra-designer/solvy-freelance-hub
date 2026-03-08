import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Preventivo } from "@/types/preventivo";

// ── Color palette ──
const DARK = [33, 33, 33] as const;
const GRAY = [150, 150, 150] as const;
const LIGHT_GRAY = [210, 210, 210] as const;
const TABLE_HEAD_BG = [235, 235, 235] as const;
const TABLE_ALT_BG = [248, 248, 248] as const;

// Soft gradient for bottom-right corner (peach/pink/lavender)
function drawCornerGradient(doc: jsPDF, pw: number, ph: number) {
  const size = 180;
  const steps = 40;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const r = 255;
    const g = 230 - t * 60;
    const b = 220 - t * 30 + t * 80;
    const alpha = 0.08 + t * 0.06;
    doc.setFillColor(r, g, b);
    doc.setGState(doc.GState({ opacity: alpha }));
    const radius = size - (size * i) / steps;
    doc.circle(pw + 10, ph + 10, radius, "F");
  }
  doc.setGState(doc.GState({ opacity: 1 }));
}

function addLogo(doc: jsPDF, dataUrl: string, x: number, y: number, maxW: number, maxH: number) {
  if (!dataUrl) return;
  try {
    doc.addImage(dataUrl, "PNG", x, y, maxW, maxH);
  } catch {
    // ignore invalid images
  }
}

// Black accent line
function accentLine(doc: jsPDF, x: number, y: number, w: number) {
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.5);
  doc.line(x, y, x + w, y);
}

export function generatePDF(p: Preventivo) {
  // Landscape A4
  const doc = new jsPDF("l", "mm", "a4");
  const pw = 297; // landscape width
  const ph = 210; // landscape height
  const ml = 25; // margin left
  const mr = 25;
  const cw = pw - ml - mr;

  // ═══════════════════════════════════════
  // PAGE 1 — COVER
  // ═══════════════════════════════════════
  drawCornerGradient(doc, pw, ph);

  // Client logo top-left
  if (p.logoCliente) addLogo(doc, p.logoCliente, ml, 18, 35, 25);

  // Freelancer logo top-right
  if (p.logoFreelancer) addLogo(doc, p.logoFreelancer, pw - mr - 30, 18, 30, 25);

  // "PREVENTIVO" label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(...GRAY);
  doc.setCharSpace(3);
  doc.text("PREVENTIVO", ml, 90);
  doc.setCharSpace(0);

  // Project name — big bold
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(...DARK);
  const titleLines = doc.splitTextToSize(p.nomeProgetto, pw * 0.6);
  doc.text(titleLines, ml, 108);

  // Bottom section — client info left, freelancer info right
  const bottomY = ph - 30;

  // Client info — bottom left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text(p.nomeCliente, ml, bottomY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(`Preventivo N° ${p.numero}`, ml, bottomY + 6);
  doc.text(`Data: ${new Date(p.dataEmissione).toLocaleDateString("it-IT")}`, ml, bottomY + 11);

  // Freelancer info — bottom right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text(p.sottotitolo || "Freelancer", pw - mr, bottomY, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(
    `Validità: ${new Date(p.dataValidita).toLocaleDateString("it-IT")}`,
    pw - mr, bottomY + 6, { align: "right" }
  );

  // Collaborator logos
  if (p.logoCollaboratori.length > 0) {
    const logoW = 18;
    const gap = 6;
    const totalW = p.logoCollaboratori.length * logoW + (p.logoCollaboratori.length - 1) * gap;
    let startX = (pw - totalW) / 2;
    p.logoCollaboratori.forEach((logo) => {
      addLogo(doc, logo, startX, ph - 55, logoW, logoW);
      startX += logoW + gap;
    });
  }

  // ═══════════════════════════════════════
  // PAGE 2 — ATTIVITÀ / PRICING
  // ═══════════════════════════════════════
  doc.addPage();
  drawCornerGradient(doc, pw, ph);

  // Header
  accentLine(doc, ml, 20, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...DARK);
  doc.text("Attività", ml, 32);

  // Table
  const unitaMap: Record<string, string> = { ore: "Ore", giorni: "Giorni", pezzi: "Pezzi", forfait: "Forfait" };

  autoTable(doc, {
    startY: 44,
    margin: { left: ml, right: mr },
    head: [["", "ore", "costo"]],
    body: p.voci.map((v) => [
      v.descrizione,
      v.unita === "forfait" ? "-" : String(v.quantita),
      `€ ${v.prezzoUnitario.toFixed(2)}/${unitaMap[v.unita]?.toLowerCase() || v.unita}`,
    ]),
    styles: {
      fontSize: 10,
      cellPadding: { top: 5, bottom: 5, left: 8, right: 8 },
      lineColor: [230, 230, 230],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [...TABLE_HEAD_BG] as [number, number, number],
      textColor: [...DARK] as [number, number, number],
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [...TABLE_ALT_BG] as [number, number, number],
    },
    columnStyles: {
      0: { cellWidth: cw * 0.65 },
      1: { cellWidth: cw * 0.15, halign: "center" },
      2: { cellWidth: cw * 0.20, halign: "right" },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 100;

  // Total row
  const subtotal = p.voci.reduce((s, v) => s + v.quantita * v.prezzoUnitario, 0);
  const iva = subtotal * (p.ivaPercentuale / 100);
  const total = subtotal + iva;

  const totalRowY = finalY + 2;
  doc.setFillColor(...TABLE_HEAD_BG);
  doc.rect(ml, totalRowY, cw, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text(`€ ${total.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`, pw - mr - 8, totalRowY + 7, { align: "right" });

  // IVA note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  if (p.ivaPercentuale > 0) {
    doc.text(`Subtotale: €${subtotal.toFixed(2)} + IVA ${p.ivaPercentuale}%`, ml, totalRowY + 16);
  } else {
    doc.text("IVA esclusa.", pw - mr - 8, totalRowY + 16, { align: "right" });
  }

  // Two columns below: Tipologia & Condizioni di pagamento
  const colY = totalRowY + 28;
  const colW = cw / 2 - 10;

  // Left column — Tempistiche / Tipologia
  if (p.tempistiche) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    doc.text("Tipologia di collaborazione", ml, colY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const tempLines = doc.splitTextToSize(p.tempistiche, colW);
    doc.text(tempLines, ml, colY + 7);
  }

  // Right column — Condizioni di pagamento
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Condizioni di pagamento", ml + colW + 20, colY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const payText = `Pagamento tramite bonifico bancario entro 30gg dalla data di emissione della fattura.`;
  const payLines = doc.splitTextToSize(payText, colW);
  doc.text(payLines, ml + colW + 20, colY + 7);

  // Closing signature — bottom right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...GRAY);
  doc.text("Cordiali saluti,", pw - mr, ph - 35, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text(p.sottotitolo || "Il Freelancer", pw - mr, ph - 28, { align: "right" });

  // ═══════════════════════════════════════
  // PAGE 3 — TERMINI E CONDIZIONI
  // ═══════════════════════════════════════
  doc.addPage();

  // Page number top-right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(48);
  doc.setTextColor(220, 220, 220);
  doc.text("03", pw - mr, 30, { align: "right" });

  // Header
  accentLine(doc, ml, 20, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.text("T&C", ml, 32);

  // "TERMINI E CONDIZIONI" label on left
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.setCharSpace(1.5);
  doc.text("TERMINI E", ml, 50);
  doc.text("CONDIZIONI", ml, 55);
  doc.setCharSpace(0);

  // Terms text — right area as numbered list
  const tcX = ml + 55;
  const tcW = cw - 55;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  // Split T&C into numbered items
  const rawTerms = p.terminiCondizioni.trim();
  const termItems = rawTerms.split(/\n/).filter(line => line.trim().length > 0);

  let tcY = 50;
  termItems.forEach((item) => {
    const cleanItem = item.trim();
    const lines = doc.splitTextToSize(cleanItem, tcW);
    if (tcY + lines.length * 4.5 > ph - 40) return; // don't overflow
    doc.text(lines, tcX, tcY);
    tcY += lines.length * 4.5 + 3;
  });

  // Closing message
  tcY += 6;
  if (tcY < ph - 55) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Grazie per la tua considerazione. Sarà un piacere lavorare insieme!", tcX, tcY);
    doc.text("Resto a disposizione per eventuali domande o chiarimenti.", tcX, tcY + 5);
  }

  // Footer bar
  const footerY = ph - 18;
  doc.setDrawColor(...LIGHT_GRAY);
  doc.setLineWidth(0.5);
  doc.line(ml, footerY, pw - mr, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text(p.sottotitolo || "Freelancer", ml, footerY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);

  // Footer info spread across
  const footerItems = [
    `N° ${p.numero}`,
    `Data: ${new Date(p.dataEmissione).toLocaleDateString("it-IT")}`,
    `Cliente: ${p.nomeCliente}`,
    `Preventivo ${p.nomeProgetto}`,
  ];
  const spacing = cw / (footerItems.length + 1);
  footerItems.forEach((item, i) => {
    doc.text(item, ml + spacing * (i + 1), footerY + 6, { align: "center" });
  });

  // ── Download ──
  doc.save(`${p.numero}_${p.nomeProgetto.replace(/\s+/g, "_")}.pdf`);
}
