/**
 * Copyright 2025 Voxaly Docaposte
 */

import {jsPDF} from 'jspdf';
import {svg2pdf} from 'svg2pdf.js';

export interface TextesPdf {
    titreOperationTour: string;
    logoClient: string;
    logoVote: string;
    titreBulletin: string;
    texteBulletin: string;
    signatureBulletin: string;
    cachetBulletin: string;
    logoCachet: string;
    cliquezIci: string;
    controleCachet: string;
    verifierCachetLien: string;
    texteAttention: string;
}

export class PdfGeneratorService {
    private static getTextes(): TextesPdf {
        return (window as any).textesPdf;
    }

    private async loadFontAsBase64(url: string): Promise<string> {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < uint8Array.byteLength; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
    }

    private async loadFonts(doc: jsPDF): Promise<void> {
        try {
            const base64 = await this.loadFontAsBase64('/includes/fonts/marianne/Marianne-Bold.ttf');
            doc.addFileToVFS('Marianne-Bold.ttf', base64);
            doc.addFont('Marianne-Bold.ttf', 'Marianne', 'bold');
        } catch (e) {
            console.warn('Impossible de charger la police Marianne-Bold', e);
        }

        try {
            const base64 = await this.loadFontAsBase64('/includes/fonts/marianne/Marianne-Regular.ttf');
            doc.addFileToVFS('Marianne-Regular.ttf', base64);
            doc.addFont('Marianne-Regular.ttf', 'Marianne', 'normal');
        } catch (e) {
            console.warn('Impossible de charger la police Marianne-Regular', e);
        }

        try {
            const base64 = await this.loadFontAsBase64('/includes/fonts/PTMono-Regular.ttf');
            doc.addFileToVFS('PTMono-Regular.ttf', base64);
            doc.addFont('PTMono-Regular.ttf', 'PTMono', 'normal');
        } catch (e) {
            console.warn('Impossible de charger la police PTMono-Regular', e);
        }
    }

    async generateRecepissePdf(): Promise<void> {
        const textes = PdfGeneratorService.getTextes();

        try {
            // Créer le document PDF
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Chargement des polices personnalisées
            await this.loadFonts(doc);

            // Marges
            const leftMargin = 17;
            const rightMargin = 17;
            const topMargin = 17;
            const pageWidth = 210;
            const contentWidth = pageWidth - leftMargin - rightMargin;

            let yPosition = topMargin;

            // 1. Logo client - rendu vectoriel SVG via svg2pdf.js
            try {
                // Parser le SVG pour récupérer les dimensions
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(textes.logoClient, 'image/svg+xml');
                const svgEl = svgDoc.querySelector('svg') as SVGSVGElement;

                let widthMm = 50;
                let heightMm = 20;

                if (svgEl) {
                    const viewBox = svgEl.getAttribute('viewBox');
                    const svgWidth = svgEl.getAttribute('width');
                    const svgHeight = svgEl.getAttribute('height');

                    let pxWidth: number | null = null;
                    let pxHeight: number | null = null;

                    if (viewBox) {
                        const parts = viewBox.split(/[\s,]+/);
                        if (parts.length === 4) {
                            pxWidth = parseFloat(parts[2]);
                            pxHeight = parseFloat(parts[3]);
                        }
                    } else if (svgWidth && svgHeight) {
                        pxWidth = parseFloat(svgWidth);
                        pxHeight = parseFloat(svgHeight);
                    }

                    if (pxWidth && pxHeight) {
                        widthMm = (pxWidth * 0.264583) / 3;
                        heightMm = (pxHeight * 0.264583) / 3;
                    }

                    await svg2pdf(svgEl, doc, {
                        x: leftMargin - 4,
                        y: yPosition - 1,
                        width: widthMm + 15,
                        height: heightMm + 16,
                    });
                }

                yPosition += heightMm + 30;
            } catch (error) {
                console.warn('Impossible de charger le logo client:', error);
                yPosition += 10;
            }



            // 3. Logo vote (respect du ratio original)
            const logoTargetHeight = 18; // hauteur cible en mm
            try {
                const logoVoteBase64 = await this.loadImageAsBase64(textes.logoVote);
                const logoDims = await this.getImageDimensions(textes.logoVote);
                const logoRatio = logoDims.width / logoDims.height;
                const logoW = logoTargetHeight * logoRatio;
                doc.addImage(logoVoteBase64, 'PNG', leftMargin, yPosition - 8, logoW, logoTargetHeight);
            } catch (error) {
                console.warn('Impossible de charger le logo vote:', error);
            }

            doc.setFontSize(18);
            doc.setFont('Marianne', 'bold');
            const titleLines = this.splitTextToFitWidth(doc, textes.titreBulletin, contentWidth);
            titleLines.forEach(line => {
                doc.text(line, leftMargin + 23, yPosition);
                yPosition += 7;
            });

            doc.setFontSize(14);
            doc.setFont('Marianne', 'normal');
            const operationLines = this.splitTextToFitWidth(doc, textes.titreOperationTour, contentWidth - 23);
            operationLines.forEach(line => {
                doc.text(line, leftMargin + 23, yPosition);
                yPosition += 6;
            });
            yPosition += 9;

            // 4. Texte du bulletin
            try {
                const logoCachetBase64 = await this.loadImageAsBase64(textes.logoCachet);
                doc.addImage(logoCachetBase64, 'PNG', leftMargin, yPosition - 4, 6, 6);
            } catch (error) {
                console.warn('Impossible de charger le logo cachet:', error);
            }

            doc.setFontSize(12);
            doc.setFont('Marianne', 'normal');
            doc.setTextColor(0, 0, 0);

            const texteLines = this.splitTextToFitWidth(doc, textes.texteBulletin, contentWidth - 10);
            texteLines.forEach(line => {
                doc.text(line, leftMargin + 7, yPosition);
                yPosition += 5;
            });

            // 5. Boîte d'information (simulée avec du texte)
            const rectHeight = 20;
            doc.setFillColor(246, 246, 246); // #E6E9F0
            doc.rect(leftMargin, yPosition, contentWidth, rectHeight, 'F');
            doc.line(leftMargin, yPosition + rectHeight, leftMargin + contentWidth, yPosition + rectHeight);

            // Utiliser jsPDF pour calculer automatiquement les lignes
            doc.setFontSize(6);
            doc.setFont('PTMono', 'normal');
            doc.setTextColor(0, 0, 0);

            // Découper le texte automatiquement selon la largeur de la boîte
            doc.text(textes.cachetBulletin, leftMargin + 2, yPosition + 7);

            yPosition += rectHeight + 10;

            // 6. Lien de vérification
            doc.setFontSize(12);
            doc.setFont('Marianne', 'normal');
            doc.setTextColor(0, 0, 0); // Noir pour le texte normal

            // Texte normal
            const normalText = `${textes.controleCachet} `;
            doc.text(normalText, leftMargin + 7, yPosition);

           // Calculer la position pour "cliquez ici"
            const normalTextWidth = doc.getTextWidth(normalText);
            const linkStartX = leftMargin + normalTextWidth + 7;

            // Texte du lien en bleu
            doc.setTextColor(0, 0, 255); // Bleu pour le lien
            doc.text(textes.cliquezIci, linkStartX, yPosition);

            // Construire l'URL complète si elle est relative
            let fullUrl = textes.verifierCachetLien;
            if (!fullUrl.startsWith('https://')) {
                const baseUrl = `${window.location.protocol}//${window.location.host}`;
                fullUrl = fullUrl.startsWith('/') ? baseUrl + fullUrl : baseUrl + '/' + fullUrl;
            }

            // Ajouter le cachet à l'URL
            const completeUrl = fullUrl + textes.cachetBulletin;

            // Ajouter le lien cliquable uniquement sur "cliquez ici"
            const linkWidth = doc.getTextWidth(textes.cliquezIci);
            doc.link(linkStartX, yPosition - 3, linkWidth, 5, {url: completeUrl});

            // 7. Message attention
            yPosition += 15;
            doc.setFontSize(12);
            doc.setFont('Marianne', 'bold');
            doc.setTextColor(0, 0, 0);

            const texteAttention = this.splitTextToFitWidth(doc, textes.texteAttention, contentWidth - 10);
            texteAttention.forEach(line => {
                doc.text(line, leftMargin + 7, yPosition);
                yPosition += 5;
            });


            // Sauvegarder le PDF
            doc.save('Recepisse_de_vote.pdf');

        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            throw error;
        }
    }

    private async loadImageAsBase64(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    private async getImageDimensions(url: string): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = reject;
            img.src = url;
        });
    }

    private splitTextToFitWidth(doc: jsPDF, text: string, maxWidth: number): string[] {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = doc.getTextWidth(testLine);

            if (testWidth <= maxWidth) {
                currentLine = testLine;
            } else if (currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                // Mot trop long, on le coupe
                lines.push(word);
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }
}