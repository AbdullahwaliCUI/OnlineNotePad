// Google Translate API integration
export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
  confidence?: number;
}

export interface TranslationOptions {
  from?: string; // Source language (auto-detect if not provided)
  to: string;    // Target language
  text: string;  // Text to translate
}

class TranslationService {
  private apiKey: string;
  private baseUrl = 'https://translation.googleapis.com/language/translate/v2';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Google Translate API key not found. Translation features will be disabled.');
    }
  }

  /**
   * Check if translation service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Translate text using Google Translate API
   */
  async translateText(options: TranslationOptions): Promise<TranslationResult> {
    if (!this.isAvailable()) {
      throw new Error('Google Translate API key not configured');
    }

    const { from, to, text } = options;

    if (!text.trim()) {
      return { translatedText: text };
    }

    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        q: text,
        target: to,
        format: 'text',
      });

      // Add source language if specified
      if (from && from !== 'auto') {
        params.append('source', from);
      }

      const response = await fetch(`${this.baseUrl}?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Translation failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (!data.data || !data.data.translations || data.data.translations.length === 0) {
        throw new Error('Invalid response from Google Translate API');
      }

      const translation = data.data.translations[0];
      
      return {
        translatedText: translation.translatedText,
        detectedLanguage: translation.detectedSourceLanguage,
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
    if (!this.isAvailable()) {
      return this.getOfflineLanguages();
    }

    try {
      const response = await fetch(`${this.baseUrl}/languages?key=${this.apiKey}&target=en`);
      
      if (!response.ok) {
        return this.getOfflineLanguages();
      }

      const data = await response.json();
      
      return data.data.languages.map((lang: any) => ({
        code: lang.language,
        name: lang.name,
      }));
    } catch (error) {
      console.error('Error fetching supported languages:', error);
      return this.getOfflineLanguages();
    }
  }

  /**
   * Fallback language list when API is not available
   */
  private getOfflineLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: 'ur', name: 'Urdu' },
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'Hindi' },
      { code: 'ar', name: 'Arabic' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
    ];
  }

  /**
   * Quick translate from Urdu to English (most common use case)
   */
  async translateUrduToEnglish(urduText: string): Promise<string> {
    try {
      const result = await this.translateText({
        from: 'ur',
        to: 'en',
        text: urduText,
      });
      return result.translatedText;
    } catch (error) {
      console.error('Urdu to English translation failed:', error);
      // Return original text if translation fails
      return urduText;
    }
  }

  /**
   * Auto-detect language and translate to English
   */
  async autoTranslateToEnglish(text: string): Promise<TranslationResult> {
    try {
      return await this.translateText({
        from: 'auto',
        to: 'en',
        text,
      });
    } catch (error) {
      console.error('Auto-translation failed:', error);
      return { translatedText: text };
    }
  }
}

// Export singleton instance
export const translationService = new TranslationService();

// Export common language codes
export const LANGUAGE_CODES = {
  URDU: 'ur',
  ENGLISH: 'en',
  HINDI: 'hi',
  ARABIC: 'ar',
  AUTO_DETECT: 'auto',
} as const;

// Export utility functions
export const isTranslationAvailable = () => translationService.isAvailable();
export const translateUrduToEnglish = (text: string) => translationService.translateUrduToEnglish(text);
export const autoTranslateToEnglish = (text: string) => translationService.autoTranslateToEnglish(text);