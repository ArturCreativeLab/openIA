import React, { useEffect, useState, useRef } from 'react';
import { MicIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

interface VoiceRecognitionProps {
  onSuccess: () => void;
}

// Extend the Window interface to include SpeechRecognition properties
declare global {
    interface Window {
      SpeechRecognition: SpeechRecognitionStatic;
      webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

const COMMAND_PHRASE = "abrir sistema operativo";

const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({ onSuccess }) => {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("El reconocimiento de voz no es compatible con este navegador.");
      setStatus('error');
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setStatus('listening');
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      setStatus('processing');
      if (transcript === COMMAND_PHRASE) {
        setStatus('success');
        setTimeout(onSuccess, 1000);
      } else {
        setError(`Frase incorrecta. Se esperaba "${COMMAND_PHRASE}".`);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
            setError('No se detectó voz. Inténtalo de nuevo.');
        } else if (event.error === 'not-allowed') {
            setError('Acceso al micrófono denegado. Habilítalo en los ajustes del navegador.');
        } else {
            setError('Ocurrió un error con el reconocimiento de voz.');
        }
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
    };
    
    recognition.onend = () => {
      // Check status to avoid race conditions on success/error
      if (statusRef.current === 'listening') {
         setStatus('idle');
      }
    };

    recognitionRef.current = recognition;
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSuccess]);

  // Use a ref to get the latest status in the onend callback
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);


  const handleMicClick = () => {
    if (recognitionRef.current && status === 'idle') {
      try {
        recognitionRef.current.start();
      } catch(e) {
        // May fail if already started
        console.error("Could not start recognition:", e);
        setError('No se pudo iniciar el reconocimiento de voz.');
        setStatus('error');
      }
    }
  };
  
  const getStatusContent = () => {
    switch(status) {
        case 'listening':
            return <LoadingSpinner message="Escuchando..." />;
        case 'processing':
            return <LoadingSpinner message="Procesando..." />;
        case 'success':
            return (
                <div className="flex flex-col items-center justify-center text-green-400">
                    <MicIcon className="w-20 h-20 mb-4" />
                    <p className="text-lg font-semibold">Llave de Voz Válida</p>
                </div>
            );
        case 'error':
            return (
                <div className="flex flex-col items-center justify-center text-red-400 text-center">
                    <MicIcon className="w-20 h-20 mb-4" />
                    <p className="text-lg font-semibold">{error || 'Error'}</p>
                </div>
            );
        case 'idle':
        default:
            return (
                <button
                    onClick={handleMicClick}
                    className="relative w-40 h-40 rounded-full border-4 border-slate-700 flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/50 group"
                    aria-label="Iniciar reconocimiento de voz"
                >
                    <MicIcon className="w-20 h-20 text-slate-500 group-hover:text-purple-400 transition-colors duration-300" />
                </button>
            );
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[160px]">
        {getStatusContent()}
    </div>
  );
};

export default VoiceRecognition;