'use client';

import { useState, useEffect } from 'react';
import { useVoiceRecognition, SPEECH_LANGUAGES } from '@/hooks/useVoiceRecognition';
import { translationService, LANGUAGE_CODES } from '@/lib/translation';
import toast from 'react-hot-toast';

interface VoiceInputProps {
  onTextInsert: (text: string) => void;
  className?: string;
}

export default function VoiceInput({ onTextInsert, className = '' }: VoiceInputProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<string>(SPEECH_LANGUAGES.URDU_PAKISTAN);
  const [targetLanguage, setTargetLanguage] = useState<string>(LANGUAGE_CODES.ENGLISH);
  const [showSettings, setShowSettings] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);

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
      toast.error(error);
    },
    onStart: () => {
      toast.success('🎤 Voice recording started');
    },
    onEnd: () => {
      toast.success('🎤 Voice recording stopped');
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
        
        // Show success message
        toast.success(`Translated: "${text}" → "${result.translatedText}"`);
        
      } else {
        // Insert original text without translation
        onTextInsert(text);
        toast.success(`Voice input: "${text}"`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback: insert original text
      onTextInsert(text);
      toast.error('Translation failed, inserted original text');
    } finally {
      setIsTranslating(false);
      resetTranscript();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      // When stopping, process the current transcript
      handleStop();
    } else {
      if (!isSupported) {
        toast.error('Voice recognition is not supported in this browser');
        return;
      }
      startListening();
    }
  };

  const handleStop = () => {
    stopListening();
    // Process any transcript that was captured (final or interim)
    const textToProcess = transcript.trim() || interimTranscript.trim();
    if (textToProcess) {
      handleVoiceResult(textToProcess);
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
          onClick={toggleListening}
          disabled={isTranslating}
          className={`px-3 py-1.5 text-sm border rounded transition-all duration-200 flex items-center gap-2 ${
            isListening
              ? 'bg-red-500 text-white border-red-500 hover:bg-red-600 animate-pulse'
              : isTranslating
              ? 'bg-yellow-500 text-white border-yellow-500 cursor-not-allowed'
              : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
          }`}
          title={isListening ? 'Click to Stop Recording and Insert Text' : 'Start Voice Input'}
        >
          {isListening ? (
            <>
              🔴 Click to Stop
            </>
          ) : isTranslating ? (
            <>
              🔄 Translating...
            </>
          ) : (
            <>
              🎤 Voice
            </>
          )}
        </button>

        {/* Stop Button (when listening) */}
        {isListening && (
          <button
            type="button"
            onClick={handleStop}
            className="px-2 py-1.5 text-xs bg-gray-600 text-white border border-gray-600 rounded hover:bg-gray-700 transition-colors"
            title="Stop and Insert"
          >
            ⏹️ Stop
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
      {(isListening || interimTranscript) && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <div className="text-blue-700 font-medium mb-1">🎤 Live Transcript:</div>
          <div className="text-gray-800">
            {transcript}
            {interimTranscript && (
              <span className="text-gray-500 italic">{interimTranscript}</span>
            )}
            {isListening && <span className="animate-pulse">|</span>}
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

      {/* Error Display */}
      {error && (
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