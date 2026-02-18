import React, { useState } from "react";
import { Download, Loader2, CheckCircle, Printer } from "lucide-react";

interface ExportPDFProps {
    targetId: string;
    username: string;
}

// ── Detect if the browser is likely a mobile/low-memory device ──────────────
function isMobileDevice(): boolean {
    if (typeof navigator === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}

// ── Print-based PDF (works on ALL devices, no canvas needed) ─────────────────
function printAsPDF(username: string) {
    const style = document.createElement("style");
    style.id = "__pdf-print-style__";
    style.textContent = `
        @media print {
            /* Hide everything except the dashboard */
            body > *:not(#__pdf-print-root__) { display: none !important; }
            #__pdf-print-root__ { display: block !important; }

            /* Reset layout for print */
            html, body {
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #0a0a0f !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }

            /* Hide UI elements that shouldn't appear in PDF */
            button, [data-no-print], .mesh-bg, .full-bg-animation,
            canvas.antigravity-canvas { display: none !important; }

            /* Ensure cards print with background */
            .card, .glass, .stat-card {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                break-inside: avoid;
            }

            /* Page breaks */
            .page-break { page-break-before: always; }
        }
    `;
    document.head.appendChild(style);

    // Wrap the dashboard in a print root
    const target = document.getElementById("dashboard-content");
    if (!target) return;

    const printRoot = document.createElement("div");
    printRoot.id = "__pdf-print-root__";
    printRoot.style.cssText = "display:none;";
    printRoot.innerHTML = target.outerHTML;
    document.body.appendChild(printRoot);

    // Trigger print dialog (user saves as PDF)
    setTimeout(() => {
        window.print();
        // Cleanup after print dialog closes
        setTimeout(() => {
            style.remove();
            printRoot.remove();
        }, 1000);
    }, 200);
}

// ── Canvas-based PDF (desktop only) ──────────────────────────────────────────
async function canvasExportPDF(targetId: string, username: string) {
    const EXPORT_WIDTH = 1280;
    // Reduce scale to 1.5 to stay within canvas size limits
    const CANVAS_SCALE = 1.5;

    let wrapper: HTMLDivElement | null = null;

    try {
        const html2canvas = (await import("html2canvas")).default;
        const { jsPDF } = await import("jspdf");

        const element = document.getElementById(targetId);
        if (!element) throw new Error("Dashboard element not found");

        // 1. Clone into a hidden fixed-width container
        wrapper = document.createElement("div");
        wrapper.style.cssText = `
            position: fixed;
            top: -99999px;
            left: -99999px;
            width: ${EXPORT_WIDTH}px;
            overflow: visible;
            z-index: -9999;
            pointer-events: none;
        `;

        const clone = element.cloneNode(true) as HTMLElement;
        clone.style.cssText = `
            width: ${EXPORT_WIDTH}px;
            min-width: ${EXPORT_WIDTH}px;
            max-width: ${EXPORT_WIDTH}px;
            overflow: visible;
        `;

        // Remove any canvas elements from clone (they can't be cloned)
        clone.querySelectorAll("canvas").forEach((c) => {
            const placeholder = document.createElement("div");
            placeholder.style.cssText = `
                width: ${c.width}px;
                height: ${c.height}px;
                background: var(--bg-elevated, #1e1e2a);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #555570;
                font-size: 12px;
            `;
            placeholder.textContent = "[Chart — see web version]";
            c.parentNode?.replaceChild(placeholder, c);
        });

        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);

        // Wait for layout
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

        // 2. Capture
        const isDark = document.documentElement.getAttribute("data-theme") !== "light";
        const fullCanvas = await html2canvas(clone, {
            backgroundColor: isDark ? "#0a0a0f" : "#fafbfc",
            scale: CANVAS_SCALE,
            useCORS: true,
            allowTaint: true,
            logging: false,
            width: EXPORT_WIDTH,
            windowWidth: EXPORT_WIDTH,
            scrollX: 0,
            scrollY: 0,
            imageTimeout: 15000,
        });

        // 3. Build PDF with correct multi-page slicing
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfPageWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();

        const canvasWidth = fullCanvas.width;
        const canvasHeight = fullCanvas.height;

        const mmPerPx = pdfPageWidth / canvasWidth;
        const pageHeightInCanvasPx = Math.floor(pdfPageHeight / mmPerPx);
        const totalPages = Math.ceil(canvasHeight / pageHeightInCanvasPx);

        for (let page = 0; page < totalPages; page++) {
            if (page > 0) pdf.addPage();

            const srcY = page * pageHeightInCanvasPx;
            const srcH = Math.min(pageHeightInCanvasPx, canvasHeight - srcY);

            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = canvasWidth;
            pageCanvas.height = srcH;

            const ctx = pageCanvas.getContext("2d");
            if (!ctx) continue;

            ctx.drawImage(fullCanvas, 0, srcY, canvasWidth, srcH, 0, 0, canvasWidth, srcH);

            const sliceData = pageCanvas.toDataURL("image/jpeg", 0.92);
            const sliceHeightMm = srcH * mmPerPx;

            pdf.addImage(sliceData, "JPEG", 0, 0, pdfPageWidth, sliceHeightMm);

            if (page === totalPages - 1) {
                pdf.setFontSize(7);
                pdf.setTextColor(139, 148, 158);
                const footerY = Math.min(sliceHeightMm + 4, pdfPageHeight - 3);
                pdf.text(
                    `GitHub Analytics — @${username} — ${new Date().toLocaleDateString()}`,
                    pdfPageWidth / 2,
                    footerY,
                    { align: "center" }
                );
            }
        }

        pdf.save(`github-analytics-${username}.pdf`);
    } finally {
        if (wrapper && document.body.contains(wrapper)) {
            document.body.removeChild(wrapper);
        }
    }
}

// ── Component ─────────────────────────────────────────────────────────────────
export const ExportPDF: React.FC<ExportPDFProps> = ({ targetId, username }) => {
    const [exporting, setExporting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        setSuccess(false);

        try {
            if (isMobileDevice()) {
                // Mobile: use print dialog (Save as PDF in browser)
                printAsPDF(username);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                // Desktop: use canvas → jsPDF
                await canvasExportPDF(targetId, username);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (error) {
            console.error("PDF export failed:", error);
            // Fallback to print on any canvas error
            try {
                printAsPDF(username);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } catch {
                alert("Failed to export PDF. Please use your browser's Print → Save as PDF option.");
            }
        } finally {
            setExporting(false);
        }
    };

    const mobile = typeof navigator !== "undefined" && isMobileDevice();

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
                    {mobile ? "Opening..." : "Exporting..."}
                </>
            ) : success ? (
                <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Done!
                </>
            ) : (
                <>
                    {mobile ? (
                        <Printer className="w-3.5 h-3.5" />
                    ) : (
                        <Download className="w-3.5 h-3.5" />
                    )}
                    {mobile ? "Save as PDF" : "Export PDF"}
                </>
            )}
        </button>
    );
};
