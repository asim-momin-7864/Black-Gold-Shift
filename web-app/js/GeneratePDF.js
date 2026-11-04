// GeneratePDF.js
import { getFormattedDate, getDateHeading } from "./docId.js";

const generatePdfButton = document.getElementById("GeneratePDFButton");

generatePdfButton?.addEventListener("click", async function () {
  if (generatePdfButton.disabled) return;

  generatePdfButton.disabled = true;
  const originalText = generatePdfButton.innerText;
  generatePdfButton.innerText = "Generating...";

  try {
    const todaysDate = getFormattedDate();
    const todaysDateForPDF = getDateHeading();

    const { jsPDF } = window.jspdf;
    const element = document.getElementById("all-table-container");

    // Capture the DOM as a canvas and prepare the PDF.
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const pageHeight = 297;
    const marginTop = 10;
    const marginLeft = 10;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = marginTop + 10;

    pdf.setFontSize(24);
    pdf.text("Coal Mining Shift Log", pdf.internal.pageSize.width / 2, 15, {
      align: "center",
    });

    pdf.setFontSize(12);
    pdf.text(
      `Date: ${todaysDateForPDF}`,
      pdf.internal.pageSize.width - marginLeft,
      15,
      { align: "right" }
    );

    pdf.addImage(imgData, "PNG", marginLeft, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - marginTop;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", marginLeft, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // === LOCAL DOWNLOAD ===
    pdf.save(`${todaysDate}.pdf`);
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("Failed to generate PDF. Please try again.");
  } finally {
    generatePdfButton.disabled = false;
    generatePdfButton.innerText = originalText;
  }
});
