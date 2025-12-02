import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Preferences } from '@capacitor/preferences';

// Check if running on native platform
export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();

// Splash Screen
export const useSplashScreen = () => {
  const hide = useCallback(async () => {
    if (isNative) {
      await SplashScreen.hide();
    }
  }, []);

  const show = useCallback(async () => {
    if (isNative) {
      await SplashScreen.show({
        autoHide: false,
      });
    }
  }, []);

  return { hide, show };
};

// Status Bar
export const useStatusBar = () => {
  const setStyle = useCallback(async (style: 'dark' | 'light') => {
    if (isNative && platform !== 'web') {
      await StatusBar.setStyle({
        style: style === 'dark' ? Style.Dark : Style.Light,
      });
    }
  }, []);

  const setBackgroundColor = useCallback(async (color: string) => {
    if (isNative && platform === 'android') {
      await StatusBar.setBackgroundColor({ color });
    }
  }, []);

  const hide = useCallback(async () => {
    if (isNative) {
      await StatusBar.hide();
    }
  }, []);

  const show = useCallback(async () => {
    if (isNative) {
      await StatusBar.show();
    }
  }, []);

  return { setStyle, setBackgroundColor, hide, show };
};

// Network Status
export const useNetworkStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkNetwork = async () => {
      const currentStatus = await Network.getStatus();
      setStatus(currentStatus);
      setIsOnline(currentStatus.connected);
    };

    checkNetwork();

    const listener = Network.addListener('networkStatusChange', (newStatus) => {
      setStatus(newStatus);
      setIsOnline(newStatus.connected);
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, []);

  return { status, isOnline };
};

// Haptics
export const useHaptics = () => {
  const impact = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (isNative) {
      const impactStyle = 
        style === 'light' ? ImpactStyle.Light :
        style === 'heavy' ? ImpactStyle.Heavy : ImpactStyle.Medium;
      await Haptics.impact({ style: impactStyle });
    }
  }, []);

  const notification = useCallback(async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (isNative) {
      const notificationType = 
        type === 'warning' ? NotificationType.Warning :
        type === 'error' ? NotificationType.Error : NotificationType.Success;
      await Haptics.notification({ type: notificationType });
    }
  }, []);

  const vibrate = useCallback(async (duration: number = 300) => {
    if (isNative) {
      await Haptics.vibrate({ duration });
    }
  }, []);

  return { impact, notification, vibrate };
};

// Share
export const useShare = () => {
  const share = useCallback(async (options: {
    title?: string;
    text?: string;
    url?: string;
    dialogTitle?: string;
  }) => {
    if (isNative) {
      await Share.share(options);
    } else {
      // Fallback for web
      if (navigator.share) {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });
      } else {
        // Copy to clipboard as fallback
        const shareText = `${options.title || ''}\n${options.text || ''}\n${options.url || ''}`;
        await navigator.clipboard.writeText(shareText.trim());
      }
    }
  }, []);

  const canShare = useCallback(async () => {
    if (isNative) {
      return true;
    }
    return !!navigator.share;
  }, []);

  return { share, canShare };
};

// Local Storage with Preferences (for offline caching)
export const usePreferences = () => {
  const set = useCallback(async (key: string, value: string) => {
    await Preferences.set({ key, value });
  }, []);

  const get = useCallback(async (key: string): Promise<string | null> => {
    const { value } = await Preferences.get({ key });
    return value;
  }, []);

  const remove = useCallback(async (key: string) => {
    await Preferences.remove({ key });
  }, []);

  const clear = useCallback(async () => {
    await Preferences.clear();
  }, []);

  const keys = useCallback(async (): Promise<string[]> => {
    const { keys } = await Preferences.keys();
    return keys;
  }, []);

  return { set, get, remove, clear, keys };
};

// Combined hook for app initialization
export const useNativeInit = () => {
  const { hide: hideSplash } = useSplashScreen();
  const { setStyle, setBackgroundColor } = useStatusBar();
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const initApp = async () => {
      if (isNative) {
        // Configure status bar
        await setStyle('dark');
        if (platform === 'android') {
          await setBackgroundColor('#000000');
        }
        
        // Hide splash screen after a brief delay
        setTimeout(() => {
          hideSplash();
        }, 1500);
      }
    };

    initApp();
  }, [hideSplash, setStyle, setBackgroundColor]);

  return { isNative, platform, isOnline };
};
