
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFDownloadButtonProps {
    targetId: string; // The ID of the DOM element to capture
    filename: string; // The output filename
    label?: string;
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
    targetId,
    filename,
    label = "PDF 다운로드"
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const element = document.getElementById(targetId);
            if (!element) {
                console.error(`Element with id ${targetId} not found`);
                return;
            }

            // 1. Capture the element as a canvas
            const canvas = await html2canvas(element, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
            });

            // 2. Initialize PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            // Calculate dimensions to fit width
            const ratio = pdfWidth / imgWidth;
            const scaledHeight = imgHeight * ratio;

            // 3. Handle multi-page splitting
            let heightLeft = scaledHeight;
            let position = 0;
            let pageData = canvas.toDataURL('image/png');

            // Add first page
            pdf.addImage(pageData, 'PNG', 0, position, pdfWidth, scaledHeight);
            heightLeft -= pdfHeight;

            // Add subsequent pages if content is long
            while (heightLeft >= 0) {
                position = heightLeft - scaledHeight;
                pdf.addPage();
                pdf.addImage(pageData, 'PNG', 0, position, pdfWidth, scaledHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`${filename}.pdf`);
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('PDF 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isGenerating}
            className="gap-2 text-gray-600 hover:text-gray-900 border-gray-300"
        >
            {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <FileDown className="h-4 w-4" />
            )}
            {label}
        </Button>
    );
};
