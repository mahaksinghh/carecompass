import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n';

interface VoiceInputProps {
  currentLang: LanguageCode;
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  currentLang,
  onTranscription,
  disabled = false,
}) => {
  const t = translations[currentLang];
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  useEffect(() => {
    // Check SpeechRecognition browser availability
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Select speech language code
      if (currentLang === 'hi') {
        recognition.lang = 'hi-IN';
      } else if (currentLang === 'hinglish') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-US';
      }

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscription(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        setSpeechError('Microphone audio was not detected. You can type your concern directly.');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech initialization error:', err);
      setSpeechError('Could not start microphone. Please type your message.');
      setIsListening(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-xs text-slate-500 italic flex items-center gap-1.5 mt-2">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
        <span>Voice speech not supported in this browser; manual typing is fully enabled.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleListening}
          disabled={disabled}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition border ${
            isListening
              ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
          }`}
          aria-label={isListening ? t.voiceStop : t.voiceStart}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 text-white" />
              <span>{t.voiceStop}</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-teal-600" />
              <span>{t.voiceStart} (Optional)</span>
            </>
          )}
        </button>

        {isListening && (
          <span className="text-xs text-teal-800 font-medium animate-pulse flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            {t.voiceListening}
          </span>
        )}
      </div>

      {speechError && (
        <span className="text-xs text-amber-700 font-medium">{speechError}</span>
      )}
    </div>
  );
};
