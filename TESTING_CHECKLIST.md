# 16-Day Pre-Launch Testing Checklist for Google Play Store

## ✅ CRITICAL FIXES COMPLETED

### 1. **Onboarding System** ✅
- ✅ Created 4-step interactive tutorial
- ✅ Integrated OnboardingGuard in App.tsx
- ✅ Shows automatically on first launch
- ✅ Can be replayed from Settings
- ✅ Bilingual support (English/Spanish)
- ✅ Saves completion status to localStorage

### 2. **Payment System** ✅
- ✅ Premium page with two subscription tiers
- ✅ Purchase handlers implemented
- ✅ Shows "Coming Soon" message until Play Store setup
- ✅ Complete setup guide in GOOGLE_PLAY_SETUP.md
- ✅ Error handling and loading states
- ✅ 3-day free trial included in both plans

### 3. **Routing & Navigation** ✅
- ✅ All routes properly configured in App.tsx
- ✅ Back buttons navigate correctly
- ✅ Deep linking structure ready
- ✅ 404 page for invalid routes

### 4. **Authentication** ✅
- ✅ Supabase auth integrated
- ✅ Protected routes check auth status
- ✅ Auto-confirm email signups enabled
- ✅ Message limits enforced (5 free messages/day)

## 📋 TESTING SCHEDULE (16 DAYS)

### **Days 1-3: Core Functionality**
- [ ] Test onboarding flow (clear localStorage and restart)
- [ ] Test all navigation paths from main menu
- [ ] Test authentication (signup, login, logout)
- [ ] Test message sending in all chat interfaces
- [ ] Verify message limit enforcement
- [ ] Test language toggle (English ↔ Spanish)

### **Days 4-6: Feature Testing**
- [ ] Test Divine Guidance (all 4 voices)
- [ ] Test Analysts of Faith (all assistants)
- [ ] Test Discern tool (churches, belief systems, texts)
- [ ] Test Debate Arena
- [ ] Test Storytelling features
- [ ] Test Prayer Wall (post prayers, testimonies)
- [ ] Test Daily Wisdom
- [ ] Test Sermon Lab (Public Speaking)
- [ ] Test Bible Translations
- [ ] Test Logos Circle (curriculum tracks)

### **Days 7-9: UI/UX Testing**
- [ ] Test on different screen sizes (phone, tablet)
- [ ] Test portrait and landscape orientations
- [ ] Verify all icons display correctly
- [ ] Check color scheme in light mode
- [ ] Test touch targets (minimum 44x44px)
- [ ] Verify keyboard doesn't hide input fields
- [ ] Test smooth scrolling in all areas
- [ ] Check loading states and animations

### **Days 10-12: Data & Persistence**
- [ ] Test conversation history saving
- [ ] Test saved messages feature
- [ ] Test clearing history
- [ ] Test offline behavior (if applicable)
- [ ] Verify data syncs after network reconnection
- [ ] Test logout doesn't lose unsaved data

### **Days 13-14: Edge Cases & Error Handling**
- [ ] Test with slow internet connection
- [ ] Test with no internet connection
- [ ] Test rapid button clicking
- [ ] Test long text inputs
- [ ] Test special characters in inputs
- [ ] Test back button navigation extensively
- [ ] Force close app and reopen
- [ ] Test with low battery mode

### **Days 15-16: Performance & Final Polish**
- [ ] Monitor app performance (CPU, memory)
- [ ] Check for memory leaks
- [ ] Verify smooth animations (60fps)
- [ ] Test cold start time
- [ ] Test warm start time
- [ ] Final translation review
- [ ] Final content review
- [ ] Final design review

## 🔍 KNOWN ISSUES TO MONITOR

### High Priority
1. **Logo Files Missing**: manifest.json references logo-192.png and logo-512.png in public folder
   - **Action**: Need to create or upload these files
   - **Impact**: App icon won't display correctly on home screen

2. **Database Schema**: Verify all required tables exist
   - user_message_usage (for message limits)
   - salvation_acceptances (for acceptance counter)
   - user_story_views (for daily wisdom)
   - prayers (for prayer wall)
   - testimonies (for testimony wall)

### Medium Priority
3. **Sitemap URLs**: Need to update with actual domain in public/sitemap.xml
4. **Meta Tags**: Update social sharing images and URLs in index.html
5. **useOnboarding Hook**: Created but can be removed (functionality now in App.tsx)

### Low Priority
6. **Capacitor Config**: Hot-reload URL is for development only
   - **Action**: Will need to remove server.url before production build

## ✅ BEFORE GOOGLE PLAY SUBMISSION

### Required Assets
- [ ] Create logo-192.png (192x192 pixels)
- [ ] Create logo-512.png (512x512 pixels)
- [ ] Create feature graphic (1024x500 pixels)
- [ ] Create screenshots (2-8 images per device type)
- [ ] Create promotional video (optional but recommended)

### App Store Listing
- [ ] Write compelling app description
- [ ] Choose appropriate category (Lifestyle > Religion)
- [ ] Set content rating (ESRB: Everyone)
- [ ] Add privacy policy URL
- [ ] Add terms of service URL
- [ ] Configure in-app purchases in Play Console

### Technical Requirements
- [ ] Remove capacitor server.url from config (or make conditional)
- [ ] Update sitemap.xml with actual domain
- [ ] Update index.html meta tags with actual domain and images
- [ ] Run `npm run build` to test production build
- [ ] Test production build on physical device
- [ ] Verify all API keys are in environment variables
- [ ] Set up Google Play Console products for subscriptions

### Legal & Compliance
- [ ] Create privacy policy
- [ ] Create terms of service
- [ ] Ensure GDPR compliance (if applicable)
- [ ] Add age verification (if required)
- [ ] Review Google Play content policies

## 🚀 DEPLOYMENT STEPS

1. **Build for Production**
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   ```

2. **Generate Signed APK/Bundle**
   - In Android Studio: Build → Generate Signed Bundle/APK
   - Use release keystore (create if first time)
   - Build App Bundle (.aab format - required for Play Store)

3. **Upload to Play Console**
   - Go to Google Play Console
   - Create new release
   - Upload .aab file
   - Complete store listing
   - Submit for review

4. **After Approval**
   - Set up in-app products (subscriptions)
   - Configure server-side purchase verification
   - Enable payment system in app
   - Monitor reviews and crash reports

## 📞 SUPPORT CONTACTS

- **Lovable Support**: [docs.lovable.dev](https://docs.lovable.dev)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Google Play Console**: [play.google.com/console](https://play.google.com/console)
- **Capacitor Docs**: [capacitorjs.com/docs](https://capacitorjs.com/docs)

## 📝 NOTES

- Testing should be done on physical Android devices (not just emulator)
- Test on at least 2 different Android versions (e.g., Android 11 and 13)
- Have multiple testers use the app for diverse feedback
- Document all bugs found during testing
- Keep a changelog of fixes made during testing period

---

**Last Updated**: Testing Checklist Created
**Next Review**: After Day 8 of testing
**Target Launch**: After successful 16-day testing period
