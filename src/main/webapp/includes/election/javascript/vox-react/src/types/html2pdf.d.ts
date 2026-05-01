/**
 * Copyright 2025 Voxaly Docaposte
 */

declare module 'html2pdf.js' {
    interface Html2PdfOptions {
        margin?: number | [number, number, number, number];
        filename?: string;
        image?: {
            type?: string;
            quality?: number;
        };
        html2canvas?: {
            scale?: number;
            useCORS?: boolean;
            logging?: boolean;
            allowTaint?: boolean;
            [key: string]: any;
        };
        jsPDF?: {
            unit?: string;
            format?: string;
            orientation?: 'portrait' | 'landscape';
            [key: string]: any;
        };
        enableLinks?: boolean;
        [key: string]: any;
    }

    interface Html2PdfDocument {
        from(element: HTMLElement | string): Html2PdfDocument;
        set(options: Html2PdfOptions): Html2PdfDocument;
        save(): Promise<void>;
        outputPdf(): any;
        outputImg(): any;
    }

    function html2pdf(): Html2PdfDocument;

    export default html2pdf;
}