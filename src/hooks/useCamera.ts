import { useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';

const isNative = Capacitor.isNativePlatform();

interface TakePhotoOptions {
  source?: 'camera' | 'gallery' | 'prompt';
  quality?: number;
  allowEditing?: boolean;
}

export const useCamera = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceMap = {
    camera: CameraSource.Camera,
    gallery: CameraSource.Photos,
    prompt: CameraSource.Prompt,
  };

  const takePhoto = useCallback(async (options: TakePhotoOptions = {}): Promise<Photo | null> => {
    setError(null);
    setIsLoading(true);
    try {
      const photo = await Camera.getPhoto({
        quality: options.quality ?? 85,
        allowEditing: options.allowEditing ?? false,
        resultType: CameraResultType.DataUrl,
        source: sourceMap[options.source ?? 'prompt'],
      });
      return photo;
    } catch (err) {
      const msg = (err as Error).message;
      // User cancellation is not a real error
      if (!/cancel/i.test(msg)) setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pickFromGallery = useCallback(
    (opts: Omit<TakePhotoOptions, 'source'> = {}) =>
      takePhoto({ ...opts, source: 'gallery' }),
    [takePhoto],
  );

  const captureFromCamera = useCallback(
    (opts: Omit<TakePhotoOptions, 'source'> = {}) =>
      takePhoto({ ...opts, source: 'camera' }),
    [takePhoto],
  );

  const checkPermissions = useCallback(async () => {
    if (!isNative) return { camera: 'granted', photos: 'granted' };
    return await Camera.checkPermissions();
  }, []);

  const requestPermissions = useCallback(async () => {
    if (!isNative) return { camera: 'granted', photos: 'granted' };
    return await Camera.requestPermissions();
  }, []);

  return {
    takePhoto,
    pickFromGallery,
    captureFromCamera,
    checkPermissions,
    requestPermissions,
    isLoading,
    error,
    isNative,
  };
};
