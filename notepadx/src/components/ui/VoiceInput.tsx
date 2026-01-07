'use client';

import { useState } from 'react';
import { useVoiceRecognition, SPEECH_LANGUAGES } from '@/hooks/useVoiceRecognition';
import { translationService, LANGUAGE_CODES } from '@/lib/translation';
import { useTheme } from '@/contexts/ThemeContext';

interface VoiceInputProps {
  onTextInsert: (text: string) => void;
  className?: string;
}

export default function VoiceInput({ onTextInsert, className = '' }: VoiceInputProps) {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<string>(SPEECH_LANGUAGES.URDU_PAKISTAN);
  const [targetLanguage, setTargetLanguage] = useState<string>(LANGUAGE_CODES.ENGLISH);
  const [showSettings, setShowSettings] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [forceStop, setForceStop] = useState(false);

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition({
    language: sourceLanguage,
    continuous: true,
    interimResults: true,
    onResult: async (text: string, isFinal: boolean) => {
      if (isFinal && text.trim()) {
        await handleVoiceResult(text.trim());
      }
    },
    onError: (error: string) => {
      // Only show critical errors, not notifications
      console.error('Voice error:', error);
    },
    onStart: () => {
      // Remove notification
      console.log('Voice recording started');
    },
    onEnd: () => {
      // Remove notification  
      console.log('Voice recording stopped');
    },
  });

  const handleVoiceResult = async (text: string) => {
    if (!text.trim()) return;

    try {
      if (autoTranslate && translationService.isAvailable()) {
        setIsTranslating(true);
        
        // Translate the text
        const result = await translationService.translateText({
          from: sourceLanguage.split('-')[0], // Extract language code (ur from ur-PK)
          to: targetLanguage,
          text: text,
        });

        // Insert translated text
        onTextInsert(result.translatedText);
        
        // No toast notification, just console log
        console.log(`Translated: "${text}" → "${result.translatedText}"`);
        
      } else {
        // Insert original text without translation
        onTextInsert(text);
        console.log(`Voice input: "${text}"`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback: insert original text
      onTextInsert(text);
    } finally {
      setIsTranslating(false);
      // Always reset transcript after processing
      resetTranscript();
    }
  };

  const handleStop = async () => {
    console.log('handleStop called, isListening:', isListening);
    
    // Set force stop flag
    setForceStop(true);
    
    // Immediately stop the recognition first
    stopListening();
    
    // Process any transcript that was captured (final or interim)
    const textToProcess = transcript.trim() || interimTranscript.trim();
    
    // Process the text if available
    if (textToProcess) {
      await handleVoiceResult(textToProcess);
    } else {
      // If no text, just reset without notification
      console.log('Voice recording stopped - no text captured');
      resetTranscript();
    }
    
    // Reset force stop flag after processing
    setTimeout(() => setForceStop(false), 500);
  };

  const toggleListening = () => {
    if (isListening || forceStop) {
      // When stopping via main button, process the current transcript
      handleStop();
    } else {
      if (!isSupported) {
        console.error('Voice recognition is not supported in this browser');
        return;
      }
      // Clear any previous transcript before starting
      setForceStop(false);
      resetTranscript();
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        Voice input not supported in this browser
      </div>
    );
  }

  return (
    <div className={`voice-input-container ${className}`}>
      {/* Voice Control Buttons */}
      <div className="flex items-center gap-2">
        {/* Main Voice Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleListening();
          }}
          disabled={isTranslating || forceStop}
          className={`px-3 py-1.5 text-sm border rounded transition-all duration-200 flex items-center gap-2 ${
            (isListening && !forceStop)
              ? 'bg-red-500 text-white border-red-500 hover:bg-red-600 animate-pulse'
              : isTranslating || forceStop
              ? 'bg-yellow-500 text-white border-yellow-500 cursor-not-allowed'
              : `${themeClasses.accent} text-white ${themeClasses.accent.replace('bg-', 'border-')} ${themeClasses.accentHover}`
          }`}
          title={(isListening && !forceStop) ? 'Recording... Click to Stop' : 'Start Voice Input'}
        >
          {(isListening && !forceStop) ? (
            <>
              🔴 Recording...
            </>
          ) : (isTranslating || forceStop) ? (
            <>
              🔄 Processing...
            </>
          ) : (
            <>
              🎤 Voice
            </>
          )}
        </button>

        {/* Stop Button (when listening) */}
        {(isListening && !forceStop) && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Stop button clicked');
              handleStop();
            }}
            className="px-3 py-1.5 text-xs bg-red-600 text-white border border-red-600 rounded hover:bg-red-700 transition-colors flex items-center gap-1 font-medium"
            title="Stop Recording Immediately"
          >
            ⏹️ STOP
          </button>
        )}

        {/* Settings Button */}
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="px-2 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Voice Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Live Transcript Display */}
      {(isListening && !forceStop) && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <div className="text-blue-700 font-medium mb-1">🎤 Live Transcript:</div>
          <div className="text-gray-800">
            {transcript}
            {interimTranscript && (
              <span className="text-gray-500 italic">{interimTranscript}</span>
            )}
            <span className="animate-pulse">|</span>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-2 p-3 bg-white border border-gray-300 rounded shadow-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Voice Input Settings</h4>
          
          {/* Auto-translate Toggle */}
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs text-gray-600">Auto-translate:</label>
            <button
              onClick={() => setAutoTranslate(!autoTranslate)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                autoTranslate ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  autoTranslate ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Source Language */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">Voice Language:</label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={SPEECH_LANGUAGES.URDU_PAKISTAN}>Urdu (Pakistan)</option>
              <option value={SPEECH_LANGUAGES.URDU_INDIA}>Urdu (India)</option>
              <option value={SPEECH_LANGUAGES.ENGLISH_US}>English (US)</option>
              <option value={SPEECH_LANGUAGES.ENGLISH_UK}>English (UK)</option>
              <option value={SPEECH_LANGUAGES.HINDI_INDIA}>Hindi (India)</option>
              <option value={SPEECH_LANGUAGES.ARABIC}>Arabic</option>
            </select>
          </div>

          {/* Target Language (if auto-translate is enabled) */}
          {autoTranslate && (
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">Translate to:</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={LANGUAGE_CODES.ENGLISH}>English</option>
                <option value={LANGUAGE_CODES.URDU}>Urdu</option>
                <option value={LANGUAGE_CODES.HINDI}>Hindi</option>
                <option value={LANGUAGE_CODES.ARABIC}>Arabic</option>
              </select>
            </div>
          )}

          {/* Translation Status */}
          <div className="text-xs text-gray-500">
            {translationService.isAvailable() ? (
              <span className="text-green-600">✅ Free Translation Available (MyMemory API)</span>
            ) : (
              <span className="text-orange-600">⚠️ Translation service unavailable</span>
            )}
          </div>
        </div>
      )}

      {/* Error Display - Only show critical errors */}
      {error && !error.includes('No speech detected') && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          ❌ {error}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-2 text-xs text-gray-500">
        <p>
          <strong>Usage:</strong> Click 🎤 Voice, speak in {sourceLanguage.includes('ur') ? 'Urdu' : 'your selected language'}, 
          {autoTranslate && translationService.isAvailable() && ' text will be auto-translated and'} inserted at cursor position.
        </p>
      </div>
    </div>
  );
}