# Production Export Checklist — Hagion AI

Lock this file as the source of truth. Follow in order. Do not skip steps.

## 0. Lock state (already done in this repo)
- ✅ Node version pinned (`.nvmrc`, `.node-version` → `20.18.0`)
- ✅ Capacitor 7.x pinned in `package.json`
- ✅ `capacitor.config.ts` server URL gated to development only
- ✅ All edge functions deployed
- ✅ Realtime + DB triggers active for messages
- ✅ FCM + Google Play secrets configured

## 1. Export & local setup
```bash
# 1. Click "Export to GitHub" in Lovable (top right)
# 2. Clone locally
git clone <your-repo-url>
cd hagion-ai
nvm use            # picks up Node 20.18.0
npm install
```

## 2. Add native platforms
```bash
npx cap add ios
npx cap add android
npm run build
npx cap sync
```

## 3. Drop in Firebase files (REQUIRED for push)
- `android/app/google-services.json` (from Firebase Console → Android app)
- `ios/App/App/GoogleService-Info.plist` (from Firebase Console → iOS app, drag into Xcode)

## 4. Generate icons & splash
```bash
# Place a 1024x1024 icon.png and 2732x2732 splash.png in /resources/
npm install -D @capacitor/assets
npx @capacitor/assets generate \
  --iconBackgroundColor '#000000' \
  --splashBackgroundColor '#000000'
```

## 5. iOS — Info.plist permissions
Edit `ios/App/App/Info.plist` and add:
```xml
<key>NSCameraUsageDescription</key>
<string>Take photos to attach to messages.</string>
<key>NSMicrophoneUsageDescription</key>
<string>Record voice notes for messages.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Attach photos from your library to messages.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Save shared images to your library.</string>
<key>NSUserTrackingUsageDescription</key>
<string>Used to personalize your experience.</string>
```

## 6. iOS — Xcode capabilities
Open `ios/App/App.xcworkspace` and enable:
- Push Notifications
- Background Modes → Remote notifications
- In-App Purchase
- Sign In with Apple (optional)

## 7. Android — AndroidManifest.xml permissions
Edit `android/app/src/main/AndroidManifest.xml`, inside `<manifest>`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="com.android.vending.BILLING" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
<uses-feature android:name="android.hardware.microphone" android:required="false" />
```

## 8. Android — Google Services Gradle plugin
In `android/build.gradle` (project-level), inside `dependencies`:
```gradle
classpath 'com.google.gms:google-services:4.4.2'
```
In `android/app/build.gradle`, at the bottom:
```gradle
apply plugin: 'com.google.gms.google-services'
```

## 9. Android signing (for Play Store)
```bash
keytool -genkey -v -keystore release.keystore -alias hagion -keyalg RSA -keysize 2048 -validity 10000
```
Add to `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file('release.keystore')
        storePassword System.getenv('KEYSTORE_PASS')
        keyAlias 'hagion'
        keyPassword System.getenv('KEY_PASS')
    }
}
buildTypes {
    release { signingConfig signingConfigs.release }
}
```

## 10. Build production artifacts
```bash
# Always rebuild + sync before native build
npm run build
npx cap sync

# Android AAB
cd android && ./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab

# iOS — open Xcode, Product → Archive
npx cap open ios
```

## 11. Store listing requirements
- Privacy policy URL (required — FCM + IAP + camera)
- App icon: 512×512 (Play), 1024×1024 (App Store)
- Feature graphic: 1024×500 (Play)
- Screenshots: phone + tablet, EN + ES locales
- App descriptions: EN + ES
- Demo account credentials (already documented in memory)

## 12. Drift prevention rules
- ❌ Never edit files inside `ios/` or `android/` from Lovable — they don't exist here
- ❌ Never bump Capacitor major version (7.x) without testing all plugins
- ❌ Never remove the `NODE_ENV === 'development'` guard around `server.url`
- ✅ Always run `npx cap sync` after pulling from GitHub
- ✅ Always rebuild web (`npm run build`) before `npx cap sync`
- ✅ Keep `.nvmrc` and `package.json` engines field in sync
