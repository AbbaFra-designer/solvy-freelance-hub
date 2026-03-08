import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Preventivo } from "@/types/preventivo";

const GREEN = [140, 230, 70] as const;  // accent green
const ORANGE = [255, 120, 30] as const; // accent orange
const DARK = [33, 33, 33] as const;
const GRAY = [120, 120, 120] as const;
const LIGHT = [245, 245, 245] as const;

function gradientRect(doc: jsPDF, x: number, y: number, w: number, h: number) {
  // Simple two-color gradient simulation
  const steps = 20;
  const sw = w / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const r = GREEN[0] + (ORANGE[0] - GREEN[0]) * t;
    const g = GREEN[1] + (ORANGE[1] - GREEN[1]) * t;
    const b = GREEN[2] + (ORANGE[2] - GREEN[2]) * t;
    doc.setFillColor(r, g, b);
    doc.rect(x + i * sw, y, sw + 0.5, h, "F");
  }
}

function addLogo(doc: jsPDF, dataUrl: string, x: number, y: number, maxW: number, maxH: number) {
  if (!dataUrl) return;
  try {
    doc.addImage(dataUrl, "PNG", x, y, maxW, maxH);
  } catch {
    // ignore invalid images
  }
}

export function generatePDF(p: Preventivo) {
  const doc = new jsPDF("p", "mm", "a4");
  const pw = 210;
  const margin = 20;
  const cw = pw - margin * 2;

  // ========== PAGE 1 — COVER ==========
  gradientRect(doc, 0, 0, pw, 6);

  // Freelancer logo
  if (p.logoFreelancer) addLogo(doc, p.logoFreelancer, margin, 20, 30, 30);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...DARK);
  doc.text(p.nomeProgetto, pw / 2, 80, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(...GRAY);
  doc.text(p.sottotitolo, pw / 2, 92, { align: "center" });

  // Quote info
  doc.setFontSize(11);
  doc.setTextColor(...GRAY);
  doc.text(`N° ${p.numero}`, pw / 2, 108, { align: "center" });
  doc.text(
    `Data: ${new Date(p.dataEmissione).toLocaleDateString("it-IT")}`,
    pw / 2, 115, { align: "center" }
  );

  // Client logo
  if (p.logoCliente) addLogo(doc, p.logoCliente, pw / 2 - 20, 130, 40, 40);

  // Client name
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text(`Per: ${p.nomeCliente}`, pw / 2, p.logoCliente ? 180 : 140, { align: "center" });

  // Collaborator logos
  if (p.logoCollaboratori.length > 0) {
    const logoW = 20;
    const gap = 8;
    const totalW = p.logoCollaboratori.length * logoW + (p.logoCollaboratori.length - 1) * gap;
    let startX = (pw - totalW) / 2;
    p.logoCollaboratori.forEach((logo) => {
      addLogo(doc, logo, startX, 250, logoW, logoW);
      startX += logoW + gap;
    });
  }

  // Footer line
  gradientRect(doc, 0, 291, pw, 6);

  // ========== PAGE 2 — BRIEF ==========
  doc.addPage();
  gradientRect(doc, 0, 0, pw, 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.text("Brief del Progetto", margin, 25);

  gradientRect(doc, margin, 30, 40, 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const briefText = p.brief.replace(/<[^>]+>/g, "").trim() || "Nessuna descrizione fornita.";
  const lines = doc.splitTextToSize(briefText, cw);
  doc.text(lines, margin, 42);

  // ========== PAGE 3 — PRICING ==========
  doc.addPage();
  gradientRect(doc, 0, 0, pw, 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.text("Dettaglio Economico", margin, 25);
  gradientRect(doc, margin, 30, 40, 2);

  const unitaMap: Record<string, string> = { ore: "Ore", giorni: "Giorni", pezzi: "Pezzi", forfait: "Forfait" };

  autoTable(doc, {
    startY: 38,
    margin: { left: margin, right: margin },
    head: [["Descrizione", "Qtà", "Unità", "Prezzo Unit.", "Totale"]],
    body: p.voci.map((v) => [
      v.descrizione,
      String(v.quantita),
      unitaMap[v.unita] || v.unita,
      `€${v.prezzoUnitario.toFixed(2)}`,
      `€${(v.quantita * v.prezzoUnitario).toFixed(2)}`,
    ]),
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [...GREEN] as [number, number, number], textColor: [30, 30, 30], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [...LIGHT] as [number, number, number] },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 120;
  const subtotal = p.voci.reduce((s, v) => s + v.quantita * v.prezzoUnitario, 0);
  const iva = subtotal * (p.ivaPercentuale / 100);
  const total = subtotal + iva;

  let ty = finalY + 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...GRAY);
  doc.text("Subtotale:", pw - margin - 60, ty);
  doc.text(`€${subtotal.toFixed(2)}`, pw - margin, ty, { align: "right" });

  ty += 7;
  doc.text(`IVA ${p.ivaPercentuale}%:`, pw - margin - 60, ty);
  doc.text(`€${iva.toFixed(2)}`, pw - margin, ty, { align: "right" });

  ty += 10;
  gradientRect(doc, pw - margin - 70, ty - 5, 70, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text("Totale:", pw - margin - 65, ty + 3);
  doc.text(`€${total.toFixed(2)}`, pw - margin - 3, ty + 3, { align: "right" });

  // Timeline & validity
  ty += 25;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  if (p.tempistiche) {
    doc.text(`Tempistiche: ${p.tempistiche}`, margin, ty);
    ty += 7;
  }
  doc.text(
    `Validità: fino al ${new Date(p.dataValidita).toLocaleDateString("it-IT")}`,
    margin, ty
  );

  // ========== PAGE 4 — T&C ==========
  doc.addPage();
  gradientRect(doc, 0, 0, pw, 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.text("Termini e Condizioni", margin, 25);
  gradientRect(doc, margin, 30, 40, 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const tcLines = doc.splitTextToSize(p.terminiCondizioni, cw);
  doc.text(tcLines, margin, 42);

  // Signature block
  const sigY = 230;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, sigY, margin + 70, sigY);
  doc.line(pw - margin - 70, sigY, pw - margin, sigY);
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Il Freelancer", margin, sigY + 5);
  doc.text("Il Cliente", pw - margin - 70, sigY + 5);

  // Footer
  gradientRect(doc, 0, 291, pw, 6);

  // Download
  doc.save(`${p.numero}_${p.nomeProgetto.replace(/\s+/g, "_")}.pdf`);
}
