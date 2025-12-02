import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.491c2e4bf4f4493f88e1648be5cecac3',
  appName: 'hagion-ai',
  webDir: 'dist',
  
  // Plugins configuration
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
  
  // Development server config - only use in development
  ...(process.env.NODE_ENV === 'development' && {
    server: {
      url: 'https://491c2e4b-f4f4-493f-88e1-648be5cecac3.lovableproject.com?forceHideBadge=true',
      cleartext: true
    }
  })
};

export default config;
