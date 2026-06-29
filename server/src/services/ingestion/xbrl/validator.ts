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
    if (!contentType) return false;
    const lower = contentType.toLowerCase();
    return lower.includes('xml') || lower.includes('xbrl') || lower.includes('html') || lower.includes('text/plain');
  }
}
