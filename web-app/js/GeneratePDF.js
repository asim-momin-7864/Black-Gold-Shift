// GeneratePDF.js

import "./firebase.js";

document
  .getElementById("GeneratePDFButton")
  .addEventListener("click", function () {
    const getDate = () => {
      const today = new Date();
      const day = today.getDate().toString().padStart(2, "0");
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const year = today.getFullYear();
      return `${day}${month}${year}M`;
    };

    const getDateForPDF = () => {
      const today = new Date();
      const day = today.getDate().toString().padStart(2, "0");
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const year = today.getFullYear();
      return `${day}-${month}-${year}-M`;
    };

    const todaysDateForPDF = getDateForPDF();
    const todaysDate = getDate();

    const { jsPDF } = window.jspdf;
    const element = document.getElementById("all-table-container");

    // Capture the DOM as a canvas and prepare the PDF.
    html2canvas(element, { scale: 2 }).then((canvas) => {
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
    });
  });
