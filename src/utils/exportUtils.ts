import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from "react-toastify";

const PDF_COLORS = {
  navy: [59, 74, 125] as [number, number, number],
  navyDeep: [44, 58, 95] as [number, number, number],
  gold: [253, 185, 19] as [number, number, number],
  green: [110, 193, 119] as [number, number, number],
  slate: [71, 85, 105] as [number, number, number],
  slateLight: [148, 163, 184] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  offWhite: [248, 250, 252] as [number, number, number],
  rowAlt: [240, 243, 250] as [number, number, number],
  border: [220, 226, 240] as [number, number, number],
};

const drawRoundedRect = (doc: jsPDF, x: number, y: number, w: number, h: number, r: number, fill: [number, number, number], stroke?: [number, number, number]) => {
  doc.setFillColor(fill[0], fill[1], fill[2]);
  if (stroke) doc.setDrawColor(stroke[0], stroke[1], stroke[2]);
  doc.roundedRect(x, y, w, h, r, r, stroke ? "FD" : "F");
};

const drawHeader = (doc: jsPDF, pageWidth: number) => {
  doc.setFillColor(PDF_COLORS.navyDeep[0], PDF_COLORS.navyDeep[1], PDF_COLORS.navyDeep[2]);
  doc.rect(0, 0, pageWidth, 30, "F");
  
  doc.setFillColor(PDF_COLORS.gold[0], PDF_COLORS.gold[1], PDF_COLORS.gold[2]);
  doc.rect(0, 27, pageWidth, 3, "F");

  try {
    drawRoundedRect(doc, 13, 6, 18, 18, 3, PDF_COLORS.white);
    doc.addImage("/images/logo/Icon1.png", "PNG", 14, 7, 16, 16);
  } catch {
    drawRoundedRect(doc, 13, 6, 18, 18, 3, PDF_COLORS.gold);
    doc.setTextColor(PDF_COLORS.navyDeep[0], PDF_COLORS.navyDeep[1], PDF_COLORS.navyDeep[2]);
    doc.setFont("helvetica", "bold"); 
    doc.setFontSize(8);
    doc.text("CRM", 22, 16.5, { align: "center" });
  }

  doc.setFontSize(13); 
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255); 
  doc.text("Tathastu Energy", 36, 13);

  doc.setFontSize(7); 
  doc.setFont("helvetica", "normal");
  doc.setTextColor(PDF_COLORS.gold[0], PDF_COLORS.gold[1], PDF_COLORS.gold[2]);
  doc.text("Powering a Sustainable Future", 36, 20);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.setFontSize(7);
  doc.setTextColor(PDF_COLORS.slateLight[0], PDF_COLORS.slateLight[1], PDF_COLORS.slateLight[2]);
  doc.text(`Generated: ${String(dateStr)}`, pageWidth - 14, 13, { align: "right" });
};

const drawFooter = (doc: jsPDF, pageWidth: number, pageNum: number, totalPages: number) => {
  const y = doc.internal.pageSize.getHeight() - 14;
  doc.setDrawColor(PDF_COLORS.border[0], PDF_COLORS.border[1], PDF_COLORS.border[2]);
  doc.setLineWidth(0.4);
  doc.line(14, y - 4, pageWidth - 14, y - 4);

  doc.setFont("helvetica", "bold"); 
  doc.setFontSize(7);
  doc.setTextColor(PDF_COLORS.gold[0], PDF_COLORS.gold[1], PDF_COLORS.gold[2]);
  doc.text("Tathastu Energy", 14, y + 2);

  doc.setFont("helvetica", "normal"); 
  doc.setTextColor(PDF_COLORS.green[0], PDF_COLORS.green[1], PDF_COLORS.green[2]);
  doc.text("Secured & Confidential", pageWidth / 2, y + 2, { align: "center" });

  doc.setTextColor(PDF_COLORS.navy[0], PDF_COLORS.navy[1], PDF_COLORS.navy[2]);
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 14, y + 2, { align: "right" });
};

export const exportToPDF = async (data: any[], columns: any[], filename: string, reportTitle: string) => {
  if (!data || data.length === 0) return toast.error("No data to export!");
  
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const tableHeaders = [columns.map(c => c.header)];
  const tableData = data.map((item, i) => [
    String(i + 1).padStart(2, "0"),
    ...columns.slice(1).map(col => String(item[col.key] || ""))
  ]);

  drawHeader(doc, pageWidth);
  
  doc.setFont("helvetica", "bold"); 
  doc.setFontSize(16);
  doc.setTextColor(PDF_COLORS.navy[0], PDF_COLORS.navy[1], PDF_COLORS.navy[2]);
  doc.text(String(reportTitle), 14, 42);

  doc.setDrawColor(PDF_COLORS.gold[0], PDF_COLORS.gold[1], PDF_COLORS.gold[2]);
  doc.setLineWidth(0.8);
  doc.line(14, 45, 72, 45);

  autoTable(doc, {
    head: tableHeaders,
    body: tableData,
    startY: 52,
    margin: { left: 14, right: 14 },
    headStyles: { 
      fillColor: PDF_COLORS.navy, 
      textColor: [255, 255, 255], 
      fontStyle: "bold", 
      fontSize: 9, 
      cellPadding: 5 
    },
    alternateRowStyles: { fillColor: PDF_COLORS.rowAlt },
    bodyStyles: { 
      fontSize: 8.5, 
      cellPadding: 2.5, 
      lineColor: PDF_COLORS.border, 
      lineWidth: 0.25 
    },
    didDrawCell: (d) => {
      if (d.section === "body" && d.column.index === 0) {
        doc.setFillColor(PDF_COLORS.gold[0], PDF_COLORS.gold[1], PDF_COLORS.gold[2]);
        doc.rect(d.cell.x, d.cell.y, 1.5, d.cell.height, "F");
      }
    },
    didDrawPage: (d) => {
      const totalPages = (doc as any).internal.getNumberOfPages();
      if (d.pageNumber > 1) drawHeader(doc, pageWidth);
      drawFooter(doc, pageWidth, d.pageNumber, totalPages);
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;
  if (finalY < doc.internal.pageSize.getHeight() - 30) {
    drawRoundedRect(doc, 14, finalY, pageWidth - 28, 12, 3, PDF_COLORS.offWhite, PDF_COLORS.border);
    doc.setFillColor(PDF_COLORS.green[0], PDF_COLORS.green[1], PDF_COLORS.green[2]);
    doc.circle(21, finalY + 6, 2, "F");
    doc.setFont("helvetica", "bold"); 
    doc.setFontSize(8); 
    doc.setTextColor(PDF_COLORS.navy[0], PDF_COLORS.navy[1], PDF_COLORS.navy[2]);
    doc.text(`Total Records: ${data.length}`, 26, finalY + 8);
  }

  doc.save(`${filename}.pdf`);
};

export const exportToExcel = async (data: any[], columns: any[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');
  worksheet.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width }));
  data.forEach((item, i) => {
    const row = worksheet.addRow({ ...item, id: i + 1 });
    
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
  });

  const headerRow = worksheet.getRow(1);
  headerRow.height = 25;
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B4A7D' } };
    cell.font = { bold: true, color: { argb: 'FFFDB913' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${filename}.xlsx`);
};