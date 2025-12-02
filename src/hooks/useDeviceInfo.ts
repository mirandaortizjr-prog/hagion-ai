import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Device, DeviceInfo, BatteryInfo } from '@capacitor/device';
import { App, AppInfo, AppState } from '@capacitor/app';

const isNative = Capacitor.isNativePlatform();

interface DeviceState {
  info: DeviceInfo | null;
  battery: BatteryInfo | null;
  appInfo: AppInfo | null;
  isActive: boolean;
}

export const useDeviceInfo = () => {
  const [state, setState] = useState<DeviceState>({
    info: null,
    battery: null,
    appInfo: null,
    isActive: true,
  });

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const info = await Device.getInfo();
        const battery = await Device.getBatteryInfo();
        
        let appInfo: AppInfo | null = null;
        if (isNative) {
          appInfo = await App.getInfo();
        }

        setState(prev => ({
          ...prev,
          info,
          battery,
          appInfo,
        }));
      } catch (error) {
        console.error('Error fetching device info:', error);
      }
    };

    fetchDeviceInfo();

    // Listen for app state changes
    let stateListener: any;
    if (isNative) {
      stateListener = App.addListener('appStateChange', (state: AppState) => {
        setState(prev => ({ ...prev, isActive: state.isActive }));
      });
    }

    return () => {
      if (stateListener) {
        stateListener.then((l: any) => l.remove());
      }
    };
  }, []);

  return {
    ...state,
    isNative,
    platform: Capacitor.getPlatform(),
  };
};

// Hook for handling back button on Android
export const useBackButton = (handler: () => void) => {
  useEffect(() => {
    if (!isNative) return;

    const listener = App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        handler();
      } else {
        window.history.back();
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [handler]);
};

// Hook for deep linking
export const useDeepLinks = (handler: (url: string) => void) => {
  useEffect(() => {
    if (!isNative) return;

    // Handle app opened via URL
    const urlListener = App.addListener('appUrlOpen', (event) => {
      handler(event.url);
    });

    return () => {
      urlListener.then(l => l.remove());
    };
  }, [handler]);
};
