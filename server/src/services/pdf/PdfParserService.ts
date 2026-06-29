// ─── PDF Parser Service (pdf-parse v2) ──────────────────────────────────────
import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import { logger } from '../../utils/logger.js';

export interface ParsedPdf {
  text: string;
  pages: number;
  metadata: Record<string, string>;
}

export interface IPdfParser {
  parse(filePath: string): Promise<ParsedPdf>;
}

export class PdfParserService implements IPdfParser {
  async parse(filePath: string): Promise<ParsedPdf> {
    logger.info(`Parsing PDF: ${filePath}`);

    const buffer = await fs.readFile(filePath);

    // pdf-parse v2: pass buffer as `data` in constructor options
    // `load()` is private and called internally by getText/getInfo
    const parser = new PDFParse({ data: new Uint8Array(buffer) });

    const textResult = await parser.getText();
    const infoResult = await parser.getInfo();

    const text = textResult.text;
    const pages = infoResult.total;
    const info = infoResult.info ?? {};

    logger.info(`PDF parsed: ${pages} pages, ${text.length} chars`);

    await parser.destroy();

    return {
      text,
      pages,
      metadata: {
        title: String(info?.Title ?? ''),
        author: String(info?.Author ?? ''),
        creator: String(info?.Creator ?? ''),
      },
    };
  }
}
