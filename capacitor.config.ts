import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.491c2e4bf4f4493f88e1648be5cecac3',
  appName: 'hagion-ai',
  webDir: 'dist',
  // Development server config - only use in development
  ...(process.env.NODE_ENV === 'development' && {
    server: {
      url: 'https://491c2e4b-f4f4-493f-88e1-648be5cecac3.lovableproject.com?forceHideBadge=true',
      cleartext: true
    }
  })
};

export default config;
