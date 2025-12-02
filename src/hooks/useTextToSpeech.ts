import { useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

const isNative = Capacitor.isNativePlatform();

interface TTSOptions {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: number;
}

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = useCallback(async (options: TTSOptions) => {
    const { text, lang = 'en-US', rate = 1.0, pitch = 1.0, volume = 1.0, voice } = options;

    if (!text) {
      setError('No text provided');
      return false;
    }

    try {
      setError(null);
      setIsSpeaking(true);
      setIsPaused(false);

      if (isNative) {
        await TextToSpeech.speak({
          text,
          lang,
          rate,
          pitch,
          volume,
          voice,
        });
      } else {
        // Web Speech API fallback
        if ('speechSynthesis' in window) {
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = lang;
          utterance.rate = rate;
          utterance.pitch = pitch;
          utterance.volume = volume;

          utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
          };

          utterance.onerror = (event) => {
            setError(event.error);
            setIsSpeaking(false);
            setIsPaused(false);
          };

          window.speechSynthesis.speak(utterance);
        } else {
          throw new Error('Speech synthesis not supported');
        }
      }

      setIsSpeaking(false);
      return true;
    } catch (err) {
      console.error('TTS Error:', err);
      setError((err as Error).message);
      setIsSpeaking(false);
      return false;
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      if (isNative) {
        await TextToSpeech.stop();
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setIsPaused(false);
    } catch (err) {
      console.error('TTS Stop Error:', err);
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      if (!isNative && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
      // Note: Native TTS doesn't support pause, so we'd need to stop and track position
    } catch (err) {
      console.error('TTS Pause Error:', err);
    }
  }, []);

  const resume = useCallback(async () => {
    try {
      if (!isNative && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    } catch (err) {
      console.error('TTS Resume Error:', err);
    }
  }, []);

  const getVoices = useCallback(async () => {
    try {
      if (isNative) {
        const result = await TextToSpeech.getSupportedVoices();
        return result.voices;
      } else if ('speechSynthesis' in window) {
        return window.speechSynthesis.getVoices().map((voice, index) => ({
          voiceURI: voice.voiceURI,
          name: voice.name,
          lang: voice.lang,
          localService: voice.localService,
          default: voice.default,
          voiceIndex: index,
        }));
      }
      return [];
    } catch (err) {
      console.error('Get Voices Error:', err);
      return [];
    }
  }, []);

  const getLanguages = useCallback(async () => {
    try {
      if (isNative) {
        const result = await TextToSpeech.getSupportedLanguages();
        return result.languages;
      } else if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const languages = [...new Set(voices.map(v => v.lang))];
        return languages;
      }
      return [];
    } catch (err) {
      console.error('Get Languages Error:', err);
      return [];
    }
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    getVoices,
    getLanguages,
    isSpeaking,
    isPaused,
    error,
    isNative,
  };
};
