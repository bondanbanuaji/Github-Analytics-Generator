import React, { useState, useRef } from "react";
import { Download, Loader2, CheckCircle } from "lucide-react";

interface ExportPDFProps {
    targetId: string;
    username: string;
}

export const ExportPDF: React.FC<ExportPDFProps> = ({ targetId, username }) => {
    const [exporting, setExporting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        setSuccess(false);

        try {
            const html2canvas = (await import("html2canvas")).default;
            const { jsPDF } = await import("jspdf");

            const element = document.getElementById(targetId);
            if (!element) throw new Error("Dashboard element not found");

            const canvas = await html2canvas(element, {
                backgroundColor: "#0a0a0f",
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: 1200,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const scaledWidth = imgWidth * ratio;
            const scaledHeight = imgHeight * ratio;

            const pageHeight = pdfHeight;
            const totalPages = Math.ceil(scaledHeight / pageHeight);

            for (let page = 0; page < totalPages; page++) {
                if (page > 0) pdf.addPage();
                const yOffset = -(page * pageHeight);
                pdf.addImage(imgData, "PNG", 0, yOffset, scaledWidth, scaledHeight);
            }

            pdf.setFontSize(8);
            pdf.setTextColor(139, 148, 158);
            pdf.text(
                `GitHub Analytics — @${username} — ${new Date().toLocaleDateString()}`,
                pdfWidth / 2,
                pdfHeight - 5,
                { align: "center" }
            );

            pdf.save(`github-analytics-${username}.pdf`);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("PDF export failed:", error);
            alert("Failed to export PDF. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 disabled:opacity-70"
            style={{
                background: success ? "var(--success)" : "var(--bg-card)",
                color: success ? "white" : "var(--text-secondary)",
                border: success ? "none" : "1px solid var(--border-primary)",
            }}
        >
            {exporting ? (
                <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Exporting...
                </>
            ) : success ? (
                <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Done!
                </>
            ) : (
                <>
                    <Download className="w-3.5 h-3.5" />
                    Export PDF
                </>
            )}
        </button>
    );
};
