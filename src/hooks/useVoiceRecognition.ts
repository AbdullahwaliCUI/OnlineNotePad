'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface VoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface VoiceRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

export interface VoiceRecognitionControls {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceRecognition(options: VoiceRecognitionOptions = {}): VoiceRecognitionState & VoiceRecognitionControls {
  const {
    language = 'ur-PK', // Default to Urdu (Pakistan)
    continuous = true,
    interimResults = true,
    maxAlternatives = 1,
    onResult,
    onError,
    onStart,
    onEnd,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      // Configure recognition
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = maxAlternatives;
      recognition.lang = language;

      // Event handlers
      recognition.onstart = () => {
        console.log('Voice recognition started');
        setIsListening(true);
        setError(null);
        onStart?.();
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          onResult?.(finalTranscript, true);
        }

        setInterimTranscript(interimTranscript);
        if (interimTranscript) {
          onResult?.(interimTranscript, false);
        }

        // Reset timeout for continuous listening
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Auto-stop after 30 seconds of silence
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
          }
        }, 30000);
      };

      recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        let errorMessage = 'Voice recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'language-not-supported':
            errorMessage = 'Language not supported. Switching to English.';
            break;
          case 'aborted':
            // Don't show error for manual abort
            console.log('Voice recognition manually stopped');
            setIsListening(false);
            setInterimTranscript('');
            return;
          default:
            errorMessage = `Voice recognition error: ${event.error}`;
        }
        
        setError(errorMessage);
        setIsListening(false);
        setInterimTranscript('');
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Only call onError for critical errors
        if (event.error !== 'no-speech') {
          onError?.(errorMessage);
        }
      };

      recognition.onend = () => {
        console.log('Voice recognition ended naturally');
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        // Only update state if we're still supposed to be listening
        // This prevents race conditions
        setIsListening(false);
        setInterimTranscript('');
        
        // Call onEnd callback
        onEnd?.();
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language, continuous, interimResults, maxAlternatives, onResult, onError, onStart, onEnd, isListening]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    if (!recognitionRef.current) {
      setError('Speech recognition not initialized');
      return;
    }

    if (isListening) {
      console.log('Already listening, ignoring start request');
      return; // Already listening
    }

    try {
      setError(null);
      setIsListening(false); // Reset state before starting
      setTranscript('');
      setInterimTranscript('');
      
      // Small delay to ensure clean state
      setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.start();
          console.log('Voice recognition start() called');
        }
      }, 100);
      
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setError('Failed to start voice recognition');
      setIsListening(false);
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    console.log('stopListening called, isListening:', isListening);
    
    // Immediately update state to stop UI
    setIsListening(false);
    setInterimTranscript('');
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Stop the actual recognition forcefully
    if (recognitionRef.current) {
      try {
        // Abort instead of stop for immediate termination
        recognitionRef.current.abort();
        console.log('Recognition abort() called for immediate stop');
      } catch (error) {
        console.error('Error aborting recognition:', error);
        try {
          // Fallback to stop if abort fails
          recognitionRef.current.stop();
        } catch (stopError) {
          console.error('Error stopping recognition:', stopError);
        }
      }
    }
    
    // Call onEnd callback
    onEnd?.();
  }, [onEnd]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}

// Utility function to check if speech recognition is supported
export const isSpeechRecognitionSupported = (): boolean => {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

// Common language codes for speech recognition
export const SPEECH_LANGUAGES = {
  URDU_PAKISTAN: 'ur-PK',
  URDU_INDIA: 'ur-IN',
  ENGLISH_US: 'en-US',
  ENGLISH_UK: 'en-GB',
  HINDI_INDIA: 'hi-IN',
  ARABIC: 'ar-SA',
  AUTO: 'auto',
} as const;