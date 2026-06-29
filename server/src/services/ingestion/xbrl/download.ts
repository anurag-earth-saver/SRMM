import { XbrlValidator } from './validator.js';

const NSE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/xml,text/xml,*/*',
  Referer: 'https://www.nseindia.com/',
};

export class XbrlDownloader {
  /**
   * Downloads the XBRL file from the given URL as a string.
   */
  async download(urlStr: string): Promise<string> {
    if (!XbrlValidator.isValidUrl(urlStr)) {
      throw new Error(`Invalid XBRL URL: ${urlStr}`);
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 60000);

    try {
      const response = await fetch(urlStr, {
        signal: abortController.signal,
        headers: NSE_HEADERS,
      });

      if (!response.ok) {
        throw new Error(`Failed to download XBRL file. Status: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') ?? undefined;
      if (!XbrlValidator.isValidMimeType(contentType)) {
        // Some hosts omit Content-Type; validate payload instead
        const text = await response.text();
        if (!XbrlValidator.looksLikeXbrl(text)) {
          throw new Error(`Invalid content type for XBRL URL: ${contentType ?? 'unknown'}`);
        }
        return text;
      }

      const text = await response.text();
      if (!XbrlValidator.looksLikeXbrl(text)) {
        throw new Error('Downloaded file does not appear to be a valid XBRL document.');
      }
      return text;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new Error(`Download timed out after 60 seconds for URL: ${urlStr}`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
