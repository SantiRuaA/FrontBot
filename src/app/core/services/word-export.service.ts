import { Injectable } from '@angular/core';
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { DocumentView } from '../../state/document/document.state';

@Injectable({
  providedIn: 'root'
})
export class WordExportService {

  constructor() { }

  exportToWord(selectedDocuments: DocumentView[]): void {
    if (!selectedDocuments || selectedDocuments.length === 0) {
      console.error('No hay documentos seleccionados para exportar.');
      return;
    }

    const sections = selectedDocuments.flatMap((doc, index) => {
      const [title, mainContent] = doc.content.split('|||TITLE|||');
      const contentParts = (mainContent || title).trim().split('\n').filter(line => line.trim() !== '');

      const question = contentParts[0]; 
      const options = contentParts.slice(1, -1); 
      const answer = contentParts[contentParts.length - 1]; 

      return [
        // Título de la pregunta
        new Paragraph({
          children: [
            new TextRun({
              text: `Pregunta ${index + 1}: ${title.trim()}`,
              bold: true,
              size: 28, 
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun(question)],
          spacing: { after: 200 },
        }),
        ...options.map(option => new Paragraph({
          children: [new TextRun(option.trim())],
          bullet: {
            level: 0
          },
        })),
        new Paragraph({
          children: [
            new TextRun({
              text: answer,
              italics: true,
            }),
          ],
          spacing: { after: 400 },
        }),
      ];
    });

    const doc = new DocxDocument({
      sections: [{
        properties: {},
        children: sections,
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'preguntas_generadas.docx');
    });
  }
}
