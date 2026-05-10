// Multi-provider Translation API integration (MyMemory + Google Translate)
export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
  confidence?: number;
  provider?: 'mymemory' | 'google';
}

export interface TranslationOptions {
  from?: string; // Source language (auto-detect if not provided)
  to: string;    // Target language
  text: string;  // Text to translate
}

class TranslationService {
  private googleApiKey: string;
  private googleBaseUrl = 'https://translation.googleapis.com/language/translate/v2';
  private myMemoryBaseUrl = 'https://api.mymemory.translated.net/get';

  constructor() {
    this.googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY || '';
    
    console.log('Translation Service initialized:', {
      googleAvailable: !!this.googleApiKey,
      myMemoryAvailable: true, // Always available (free)
    });
  }

  /**
   * Check if translation service is available
   */
  isAvailable(): boolean {
    return true; // MyMemory is always available for free
  }

  /**
   * Translate text using MyMemory API (Free)
   */
  async translateWithMyMemory(options: TranslationOptions): Promise<TranslationResult> {
    const { from, to, text } = options;

    if (!text.trim()) {
      return { translatedText: text, provider: 'mymemory' };
    }

    try {
      const params = new URLSearchParams({
        q: text,
        langpair: from ? `${from}|${to}` : `auto|${to}`,
      });

      const response = await fetch(`${this.myMemoryBaseUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`MyMemory API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.responseData || !data.responseData.translatedText) {
        throw new Error('Invalid response from MyMemory API');
      }

      // Check translation quality
      const match = data.responseData.match;
      const translatedText = data.responseData.translatedText;
      
      // If match is too low, it might be unreliable
      if (match < 0.3) {
        console.warn('Low quality translation detected:', { match, text: translatedText });
      }

      return {
        translatedText,
        confidence: match,
        provider: 'mymemory',
      };
    } catch (error) {
      console.error('MyMemory translation error:', error);
      throw error;
    }
  }

  /**
   * Translate text using Google Translate API (Paid)
   */
  async translateWithGoogle(options: TranslationOptions): Promise<TranslationResult> {
    if (!this.googleApiKey) {
      throw new Error('Google Translate API key not configured');
    }

    const { from, to, text } = options;

    if (!text.trim()) {
      return { translatedText: text, provider: 'google' };
    }

    try {
      const params = new URLSearchParams({
        key: this.googleApiKey,
        q: text,
        target: to,
        format: 'text',
      });

      // Add source language if specified
      if (from && from !== 'auto') {
        params.append('source', from);
      }

      const response = await fetch(`${this.googleBaseUrl}?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google Translate failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (!data.data || !data.data.translations || data.data.translations.length === 0) {
        throw new Error('Invalid response from Google Translate API');
      }

      const translation = data.data.translations[0];
      
      return {
        translatedText: translation.translatedText,
        detectedLanguage: translation.detectedSourceLanguage,
        provider: 'google',
      };
    } catch (error) {
      console.error('Google translation error:', error);
      throw error;
    }
  }

  /**
   * Smart translate with fallback (MyMemory first, then Google if available)
   */
  async translateText(options: TranslationOptions): Promise<TranslationResult> {
    const { from, to, text } = options;

    if (!text.trim()) {
      return { translatedText: text };
    }

    try {
      // Try MyMemory first (free)
      console.log('Attempting translation with MyMemory API...');
      const result = await this.translateWithMyMemory(options);
      
      // If confidence is good, return MyMemory result
      if (!result.confidence || result.confidence >= 0.5) {
        console.log('MyMemory translation successful:', result);
        return result;
      }
      
      // If MyMemory confidence is low and Google is available, try Google
      if (this.googleApiKey) {
        console.log('MyMemory confidence low, trying Google Translate...');
        try {
          const googleResult = await this.translateWithGoogle(options);
          console.log('Google translation successful:', googleResult);
          return googleResult;
        } catch (googleError) {
          console.warn('Google Translate failed, using MyMemory result:', googleError);
          return result; // Fallback to MyMemory result
        }
      }
      
      // Return MyMemory result even if confidence is low
      console.log('Using MyMemory result (no Google fallback):', result);
      return result;
      
    } catch (myMemoryError) {
      console.error('MyMemory translation failed:', myMemoryError);
      
      // If MyMemory fails and Google is available, try Google
      if (this.googleApiKey) {
        console.log('MyMemory failed, trying Google Translate...');
        try {
          return await this.translateWithGoogle(options);
        } catch (googleError) {
          console.error('Both translation services failed:', { myMemoryError, googleError });
          throw new Error('Translation failed: All services unavailable');
        }
      }
      
      // No fallback available
      throw myMemoryError;
    }
  }
  /**
   * Get supported languages
   */
  async getSupportedLanguages(): Promise<Array<{ code: string; name: string }>> {
    // MyMemory supports most common languages
    return this.getOfflineLanguages();
  }

  /**
   * Fallback language list (MyMemory supported languages)
   */
  private getOfflineLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: 'ur', name: 'Urdu (اردو)' },
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'Hindi (हिन्दी)' },
      { code: 'ar', name: 'Arabic (العربية)' },
      { code: 'es', name: 'Spanish (Español)' },
      { code: 'fr', name: 'French (Français)' },
      { code: 'de', name: 'German (Deutsch)' },
      { code: 'it', name: 'Italian (Italiano)' },
      { code: 'pt', name: 'Portuguese (Português)' },
      { code: 'ru', name: 'Russian (Русский)' },
      { code: 'ja', name: 'Japanese (日本語)' },
      { code: 'ko', name: 'Korean (한국어)' },
      { code: 'zh', name: 'Chinese (中文)' },
      { code: 'tr', name: 'Turkish (Türkçe)' },
      { code: 'fa', name: 'Persian (فارسی)' },
      { code: 'bn', name: 'Bengali (বাংলা)' },
      { code: 'ta', name: 'Tamil (தமிழ்)' },
      { code: 'te', name: 'Telugu (తెలుగు)' },
      { code: 'ml', name: 'Malayalam (മലയാളം)' },
      { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
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