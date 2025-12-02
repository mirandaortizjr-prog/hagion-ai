import { useState } from "react";
import { Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

const setupContent = `
HAGION AI - NATIVE MOBILE SETUP GUIDE
=====================================

PREREQUISITES
-------------
- Node.js 18+ installed
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)
- Google Play Console account (for publishing)
- Apple Developer account (for iOS publishing)

QUICK START
-----------
1. Clone and install dependencies:
   git clone <your-repo>
   cd hagion-ai
   npm install

2. Add native platforms:
   npx cap add android
   npx cap add ios  # Mac only

3. Build and sync:
   npm run build
   npx cap sync

4. Run on device/emulator:
   npx cap run android
   npx cap run ios  # Mac only

NATIVE FEATURES IMPLEMENTED
---------------------------
1. Splash Screen (@capacitor/splash-screen)
   - Automatically shows on app launch
   - 2-second duration, black background

2. Status Bar (@capacitor/status-bar)
   - Dark style with black background

3. Network Status (@capacitor/network)
   - Detects online/offline status
   - Shows offline indicator when disconnected

4. Haptic Feedback (@capacitor/haptics)
   - Light, medium, heavy impact feedback
   - Success, warning, error notifications

5. Native Share (@capacitor/share)
   - Share content via native share dialog

6. Local Storage/Offline Caching (@capacitor/preferences)
   - Cache data for offline access
   - Auto-expiration with TTL

7. Push Notifications (@capacitor/push-notifications)
   - FCM integration for Android
   - APNs integration for iOS

8. Text-to-Speech (@capacitor-community/text-to-speech)
   - Read stories and content aloud
   - Supports English and Spanish

9. In-App Purchases (cordova-plugin-purchase)
   - Google Play billing integration
   - Product IDs:
     * hagion_premium_monthly - $9.99/month
     * hagion_premium_plus_monthly - $15.99/month

10. Device Info (@capacitor/device)
    - Device information and app state

11. App Lifecycle (@capacitor/app)
    - Back button handling
    - Deep link handling

ANDROID SETUP
-------------
1. Firebase Configuration (Push Notifications):
   - Create a Firebase project
   - Download google-services.json
   - Place in android/app/

2. Google Play Billing (In-App Purchases):
   - Set up products in Google Play Console
   - Use product IDs: hagion_premium_monthly, hagion_premium_plus_monthly

3. Splash Screen Assets:
   - Place splash.png in android/app/src/main/res/drawable/
   - Recommended size: 2732x2732px

iOS SETUP (Mac only)
--------------------
1. Push Notifications:
   - Enable Push Notifications capability in Xcode
   - Configure APNs in Apple Developer Console

2. In-App Purchases:
   - Set up products in App Store Connect
   - Enable In-App Purchase capability

ENVIRONMENT VARIABLES
---------------------
Add these to your Supabase Edge Functions secrets:
- FCM_SERVER_KEY=<your-firebase-server-key>

FILES CREATED
-------------
Hooks:
- src/hooks/useNativeFeatures.ts
- src/hooks/usePushNotifications.ts
- src/hooks/useOfflineCache.ts
- src/hooks/useInAppPurchases.ts
- src/hooks/useTextToSpeech.ts
- src/hooks/useDeviceInfo.ts
- src/hooks/index.ts

Context:
- src/contexts/PremiumContext.tsx

Components:
- src/components/OfflineIndicator.tsx
- src/components/ShareButton.tsx
- src/components/TextToSpeechButton.tsx

Edge Functions:
- supabase/functions/send-push-notification/index.ts

Configuration:
- capacitor.config.ts (updated)
- NATIVE_SETUP_GUIDE.md

Database:
- push_tokens table for storing FCM tokens

BUILDING FOR PRODUCTION
-----------------------
1. Generate signed APK/Bundle:
   cd android
   ./gradlew assembleRelease  # APK
   ./gradlew bundleRelease    # AAB for Play Store

2. Upload to Google Play Console:
   - Create release in Play Console
   - Upload AAB file
   - Submit for review

TROUBLESHOOTING
---------------
1. "Store not available" error:
   - Ensure Google Play Services is installed
   - Test on a real device, not emulator

2. Push notifications not received:
   - Verify FCM_SERVER_KEY is set
   - Check Firebase project configuration

3. Build errors:
   cd android
   ./gradlew clean
   cd ..
   npx cap sync android

For more details, see NATIVE_SETUP_GUIDE.md in the project root.
`;

export const NativeSetupSummary = () => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(setupContent.trim());
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Setup guide copied to clipboard. Ready to paste in email.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or manually select and copy the text.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Copy className="w-4 h-4" />
          View Native Setup Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Native Setup Guide
            <Button
              variant={copied ? "default" : "outline"}
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy All
                </>
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4">
          <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-4 rounded-lg">
            {setupContent.trim()}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NativeSetupSummary;
