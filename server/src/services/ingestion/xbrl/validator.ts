import { URL } from 'node:url';

export class XbrlValidator {
  /**
   * Validates if a given string is a proper HTTP/HTTPS URL.
   */
  static isValidUrl(urlStr: string): boolean {
    try {
      const url = new URL(urlStr);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validates the MIME type / Content-Type of the downloaded resource.
   */
  static isValidMimeType(contentType: string | undefined): boolean {
    if (!contentType) return true;
    const lower = contentType.toLowerCase();
    return (
      lower.includes('xml') ||
      lower.includes('xbrl') ||
      lower.includes('html') ||
      lower.includes('text/plain') ||
      lower.includes('octet-stream')
    );
  }

  /** Heuristic check that payload is XBRL/XML. */
  static looksLikeXbrl(text: string): boolean {
    const sample = text.slice(0, 5000).toLowerCase();
    return sample.includes('<xbrli:xbrl') || (sample.includes('<?xml') && sample.includes('contextref'));
  }
}
