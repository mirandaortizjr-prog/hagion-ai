import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';

const isNative = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform();

export interface PushNotificationState {
  token: string | null;
  notifications: PushNotificationSchema[];
  isRegistered: boolean;
  permissionGranted: boolean;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    token: null,
    notifications: [],
    isRegistered: false,
    permissionGranted: false,
  });

  const requestPermission = useCallback(async () => {
    if (!isNative) {
      console.log('Push notifications only available on native platforms');
      return false;
    }

    try {
      const permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        const newStatus = await PushNotifications.requestPermissions();
        if (newStatus.receive === 'granted') {
          setState(prev => ({ ...prev, permissionGranted: true }));
          return true;
        }
      } else if (permStatus.receive === 'granted') {
        setState(prev => ({ ...prev, permissionGranted: true }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting push permission:', error);
      return false;
    }
  }, []);

  const register = useCallback(async () => {
    if (!isNative) return;

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        console.log('Push notification permission not granted');
        return;
      }

      await PushNotifications.register();
      setState(prev => ({ ...prev, isRegistered: true }));
    } catch (error) {
      console.error('Error registering push notifications:', error);
    }
  }, [requestPermission]);

  const unregister = useCallback(async () => {
    if (!isNative) return;

    try {
      await PushNotifications.removeAllListeners();
      setState(prev => ({ ...prev, isRegistered: false, token: null }));
    } catch (error) {
      console.error('Error unregistering push notifications:', error);
    }
  }, []);

  useEffect(() => {
    if (!isNative) return;

    // Function to save token to database
    const saveTokenToDatabase = async (token: string) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user logged in, cannot save push token');
          return;
        }

        // Upsert the token (insert or update if exists)
        const { error } = await supabase
          .from('push_tokens')
          .upsert({
            user_id: user.id,
            token,
            platform: platform as 'android' | 'ios' | 'web',
            device_info: { registered_at: new Date().toISOString() },
          }, {
            onConflict: 'token',
          });

        if (error) {
          console.error('Error saving push token:', error);
        } else {
          console.log('Push token saved to database');
        }
      } catch (err) {
        console.error('Error saving push token:', err);
      }
    };

    // Registration success
    const registrationListener = PushNotifications.addListener(
      'registration',
      (token: Token) => {
        console.log('Push registration success, token:', token.value);
        setState(prev => ({ ...prev, token: token.value }));
        
        // Save token to database
        saveTokenToDatabase(token.value);
      }
    );

    // Registration error
    const errorListener = PushNotifications.addListener(
      'registrationError',
      (error) => {
        console.error('Push registration error:', error);
      }
    );

    // Push notification received while app is in foreground
    const receivedListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
        setState(prev => ({
          ...prev,
          notifications: [...prev.notifications, notification],
        }));
      }
    );

    // Push notification action performed (user tapped notification)
    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('Push notification action performed:', action);
        // Handle navigation based on notification data
        const data = action.notification.data;
        if (data?.route) {
          // Navigate to the specified route
          window.location.href = data.route;
        }
      }
    );

    return () => {
      registrationListener.then(l => l.remove());
      errorListener.then(l => l.remove());
      receivedListener.then(l => l.remove());
      actionListener.then(l => l.remove());
    };
  }, []);

  const clearNotifications = useCallback(() => {
    setState(prev => ({ ...prev, notifications: [] }));
  }, []);

  return {
    ...state,
    register,
    unregister,
    requestPermission,
    clearNotifications,
    isNative,
  };
};
