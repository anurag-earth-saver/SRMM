import { XbrlValidator } from './validator.js';

export class XbrlDownloader {
  /**
   * Downloads the XBRL file from the given URL as a string.
   */
  async download(urlStr: string): Promise<string> {
    if (!XbrlValidator.isValidUrl(urlStr)) {
      throw new Error(`Invalid XBRL URL: ${urlStr}`);
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(urlStr, { signal: abortController.signal });
      
      if (!response.ok) {
        throw new Error(`Failed to download XBRL file. Status: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') ?? undefined;
      if (!XbrlValidator.isValidMimeType(contentType)) {
        throw new Error(`Invalid content type for XBRL URL: ${contentType}`);
      }

      const text = await response.text();
      return text;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new Error(`Download timed out after 30 seconds for URL: ${urlStr}`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
