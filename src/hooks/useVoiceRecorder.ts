import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';

const isNative = Capacitor.isNativePlatform();

interface RecordingResult {
  // Base64 audio (native) or blob URL (web)
  base64Sound?: string;
  blob?: Blob;
  blobUrl?: string;
  mimeType: string;
  durationMs: number;
}

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);

  const startTimeRef = useRef<number>(0);
  const pausedAccumRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  // Web fallback refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startTicker = () => {
    stopTicker();
    tickRef.current = window.setInterval(() => {
      const now = Date.now();
      setDurationMs(now - startTimeRef.current - pausedAccumRef.current);
    }, 200);
  };
  const stopTicker = () => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  useEffect(() => () => stopTicker(), []);

  const checkPermission = useCallback(async () => {
    if (isNative) {
      const { value } = await VoiceRecorder.hasAudioRecordingPermission();
      return value;
    }
    return !!navigator.mediaDevices?.getUserMedia;
  }, []);

  const requestPermission = useCallback(async () => {
    if (isNative) {
      const { value } = await VoiceRecorder.requestAudioRecordingPermission();
      return value;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      return false;
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setDurationMs(0);
    pausedAccumRef.current = 0;
    try {
      if (isNative) {
        const { value: granted } = await VoiceRecorder.requestAudioRecordingPermission();
        if (!granted) throw new Error('Microphone permission denied');
        await VoiceRecorder.startRecording();
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        chunksRef.current = [];
        const mr = new MediaRecorder(stream);
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        mr.start();
        mediaRecorderRef.current = mr;
      }
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setIsPaused(false);
      startTicker();
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      if (isNative) {
        await VoiceRecorder.pauseRecording();
      } else {
        mediaRecorderRef.current?.pause();
      }
      pausedAtRef.current = Date.now();
      setIsPaused(true);
      stopTicker();
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const resume = useCallback(async () => {
    try {
      if (isNative) {
        await VoiceRecorder.resumeRecording();
      } else {
        mediaRecorderRef.current?.resume();
      }
      if (pausedAtRef.current) {
        pausedAccumRef.current += Date.now() - pausedAtRef.current;
        pausedAtRef.current = 0;
      }
      setIsPaused(false);
      startTicker();
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const stop = useCallback(async (): Promise<RecordingResult | null> => {
    stopTicker();
    try {
      const finalDuration = Date.now() - startTimeRef.current - pausedAccumRef.current;

      if (isNative) {
        const result = await VoiceRecorder.stopRecording();
        setIsRecording(false);
        setIsPaused(false);
        return {
          base64Sound: result.value.recordDataBase64,
          mimeType: result.value.mimeType || 'audio/aac',
          durationMs: result.value.msDuration ?? finalDuration,
        };
      }

      const mr = mediaRecorderRef.current;
      if (!mr) {
        setIsRecording(false);
        return null;
      }
      const stopped: Blob = await new Promise((resolve) => {
        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, {
            type: mr.mimeType || 'audio/webm',
          });
          resolve(blob);
        };
        mr.stop();
      });
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
      setIsRecording(false);
      setIsPaused(false);
      return {
        blob: stopped,
        blobUrl: URL.createObjectURL(stopped),
        mimeType: stopped.type,
        durationMs: finalDuration,
      };
    } catch (err) {
      setError((err as Error).message);
      setIsRecording(false);
      setIsPaused(false);
      return null;
    }
  }, []);

  return {
    start,
    stop,
    pause,
    resume,
    checkPermission,
    requestPermission,
    isRecording,
    isPaused,
    durationMs,
    error,
    isNative,
  };
};
