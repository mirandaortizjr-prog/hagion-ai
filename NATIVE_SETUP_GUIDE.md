# Hagion AI - Native Mobile Setup Guide

This guide explains how to set up and configure native mobile features for the Hagion AI app.

## Prerequisites

- Node.js 18+ installed
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)
- Google Play Console account (for publishing)
- Apple Developer account (for iOS publishing)

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd hagion-ai
   npm install
   ```

2. **Add native platforms:**
   ```bash
   npx cap add android
   npx cap add ios  # Mac only
   ```

3. **Build and sync:**
   ```bash
   npm run build
   npx cap sync
   ```

4. **Run on device/emulator:**
   ```bash
   npx cap run android
   npx cap run ios  # Mac only
   ```

## Native Features Implemented

### 1. Splash Screen
- **Plugin:** `@capacitor/splash-screen`
- **Configuration:** `capacitor.config.ts`
- Automatically shows on app launch with 2-second duration
- Black background with centered logo

### 2. Status Bar
- **Plugin:** `@capacitor/status-bar`
- Dark style with black background
- Configurable per-screen if needed

### 3. Network Status
- **Plugin:** `@capacitor/network`
- **Hook:** `useNetworkStatus()`
- Detects online/offline status
- Shows offline indicator when disconnected

### 4. Haptic Feedback
- **Plugin:** `@capacitor/haptics`
- **Hook:** `useHaptics()`
- Light, medium, heavy impact feedback
- Success, warning, error notifications

### 5. Native Share
- **Plugin:** `@capacitor/share`
- **Component:** `<ShareButton />`
- Share content via native share dialog

### 6. Local Storage (Offline Caching)
- **Plugin:** `@capacitor/preferences`
- **Hook:** `useOfflineCache()`
- Cache data for offline access
- Auto-expiration with TTL

### 7. Push Notifications
- **Plugin:** `@capacitor/push-notifications`
- **Hook:** `usePushNotifications()`
- FCM integration for Android
- APNs integration for iOS

### 8. Text-to-Speech
- **Plugin:** `@capacitor-community/text-to-speech`
- **Component:** `<TextToSpeechButton />`
- Read stories and content aloud
- Supports English and Spanish

### 9. In-App Purchases
- **Plugin:** `cordova-plugin-purchase`
- **Hook:** `useInAppPurchases()`
- **Context:** `<PremiumProvider />`
- Google Play billing integration
- Product IDs:
  - `hagion_premium_monthly` - $9.99/month
  - `hagion_premium_plus_monthly` - $15.99/month

### 10. Device Info
- **Plugin:** `@capacitor/device`
- **Hook:** `useDeviceInfo()`
- Device information and app state

### 11. App Lifecycle
- **Plugin:** `@capacitor/app`
- Back button handling
- Deep link handling
- App state changes

## Configuration

### Android Setup

1. **Firebase Configuration (Push Notifications):**
   - Create a Firebase project
   - Download `google-services.json`
   - Place in `android/app/`

2. **Google Play Billing (In-App Purchases):**
   - Set up products in Google Play Console
   - Use product IDs: `hagion_premium_monthly`, `hagion_premium_plus_monthly`

3. **Splash Screen Assets:**
   - Place `splash.png` in `android/app/src/main/res/drawable/`
   - Recommended size: 2732x2732px

### iOS Setup (Mac only)

1. **Push Notifications:**
   - Enable Push Notifications capability in Xcode
   - Configure APNs in Apple Developer Console

2. **In-App Purchases:**
   - Set up products in App Store Connect
   - Enable In-App Purchase capability

## Environment Variables

Add these to your Supabase Edge Functions secrets:

```
FCM_SERVER_KEY=<your-firebase-server-key>
```

## Usage Examples

### Check Premium Status
```typescript
import { usePremium } from '@/contexts/PremiumContext';

const MyComponent = () => {
  const { isPremium, isPremiumPlus, purchasePremium } = usePremium();
  
  if (!isPremium) {
    return <button onClick={purchasePremium}>Upgrade to Premium</button>;
  }
  
  return <PremiumContent />;
};
```

### Use Text-to-Speech
```typescript
import { TextToSpeechButton } from '@/components/TextToSpeechButton';

<TextToSpeechButton text="This will be read aloud" />
```

### Share Content
```typescript
import { ShareButton } from '@/components/ShareButton';

<ShareButton 
  title="Daily Wisdom" 
  text="Check out this amazing story!" 
  url="https://hagion.app/story/123" 
/>
```

### Cache Data Offline
```typescript
import { useOfflineCache } from '@/hooks/useOfflineCache';

const { fetchWithCache, cachedData, isOnline } = useOfflineCache({ 
  key: 'daily-wisdom',
  ttl: 24 * 60 * 60 * 1000 // 24 hours
});

const data = await fetchWithCache(() => 
  supabase.from('stories').select('*')
);
```

## Testing

1. **Test on emulator:**
   ```bash
   npx cap run android
   ```

2. **Test on physical device:**
   - Enable USB debugging on Android
   - Connect device via USB
   - Run `npx cap run android`

3. **Live reload during development:**
   - The `capacitor.config.ts` is configured for hot reload
   - Changes in Lovable will reflect automatically

## Building for Production

1. **Generate signed APK/Bundle:**
   ```bash
   cd android
   ./gradlew assembleRelease  # APK
   ./gradlew bundleRelease    # AAB for Play Store
   ```

2. **Upload to Google Play Console:**
   - Create release in Play Console
   - Upload AAB file
   - Submit for review

## Troubleshooting

### Common Issues

1. **"Store not available" error:**
   - Ensure Google Play Services is installed on device
   - Test on a real device, not emulator

2. **Push notifications not received:**
   - Verify FCM_SERVER_KEY is set
   - Check Firebase project configuration
   - Ensure device has internet connection

3. **Offline cache not working:**
   - Check Preferences plugin is properly installed
   - Run `npx cap sync` after installing plugins

4. **Build errors:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx cap sync android
   ```

## Support

For issues or questions, contact support or open an issue in the repository.
