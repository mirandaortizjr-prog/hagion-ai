# Google Play Store Demo Account Setup

## Demo Credentials for App Review

Use these credentials when submitting to Google Play Console for app review:

### Login Information
- **Email:** `demo.hagionai@gmail.com`
- **Password:** `DemoReview2024!`

---

## What Reviewers Can Access

The demo account has **full Premium Plus access** with no limitations:

### ✅ Unlimited Features
- **Unlimited Messages** - No daily message limits (normal users have 5/day)
- **Premium Status** - Full Premium tier access
- **Premium Plus Status** - Full Premium Plus tier access
- **Faithful Friend App** - Direct access to bonus app (faithfulfriend.app)

### ✅ All App Sections Accessible
- Divine Guidance (Elohim, Christ, Holy Spirit, Trinity voices)
- Daily Wisdom stories
- All AI Assistants and Analysts
- Hagion University curriculum
- Apologetics & Debate features
- Bible Translations
- History of Christianity
- Discernment tools
- Prayer & Testimony Wall
- Public Speaking tools
- All settings and profile features

---

## How It Works

### Auto-Account Creation
When the demo credentials are used:
1. If the account doesn't exist, it's automatically created
2. User is immediately logged in
3. Full premium access is granted instantly

### No Manual Setup Required
- No need to manually create the user in any dashboard
- No subscription purchase required
- No trial period - immediate full access

---

## Technical Implementation

### Files Modified for Demo Access

1. **`src/pages/Auth.tsx`**
   - Bypasses password validation for demo email
   - Auto-creates account if it doesn't exist
   - Demo credentials: `demo.hagionai@gmail.com` / `DemoReview2024!`

2. **`src/contexts/PremiumContext.tsx`**
   - Grants `isPremium: true` for demo account
   - Grants `isPremiumPlus: true` for demo account
   - Enables access to all premium features including Faithful Friend

3. **`src/hooks/useMessageLimit.ts`**
   - Returns `null` for remaining messages (hides limit display entirely)
   - Exposes `isDemoAccount` flag for UI components
   - Prevents any "messages remaining" or "upgrade" prompts from appearing

4. **`src/pages/MainMenu.tsx`**
   - Premium Plus check for Faithful Friend access
   - Demo account can open faithfulfriend.app directly
   - Hides PRO badges for premium users (demo account has full access)

5. **`src/pages/AssistantChat.tsx`** & **`src/pages/StorytellingChat.tsx`**
   - Hides "messages remaining" badge in header for demo account
   - Hides upgrade prompts and daily limit warnings for demo account

---

## Google Play Console Setup

### App Access Instructions
When filling out the "App access" section in Google Play Console:

**Instruction name:** `Instructions for accessing my app`

**Username/Email:** `demo.hagionai@gmail.com`

**Password:** `DemoReview2024!`

**Additional information:** 
```
This demo account has full Premium Plus access enabled for review purposes.
All features are unlocked including:
- Unlimited AI chat messages
- All Divine Guidance voices
- Faithful Friend bonus app access
- All premium content and features

Simply log in with the provided credentials to access the complete app experience.
```

---

## Testing Checklist

Before submission, verify the demo account can:

- [ ] Log in successfully with credentials
- [ ] Access main menu without upgrade prompts
- [ ] Use unlimited chat messages
- [ ] Access all Divine Guidance voices
- [ ] Open Faithful Friend app (Premium Plus feature)
- [ ] Access Daily Wisdom without limits
- [ ] Use all AI Assistants
- [ ] Access Hagion University content
- [ ] View Prayer & Testimony Wall
- [ ] Access all settings

---

## Security Note

The demo account bypass is specifically for:
- `demo.hagionai@gmail.com` email only
- Google Play Store review process

Regular users must purchase subscriptions for premium access.

---

*Last updated: December 2024*
