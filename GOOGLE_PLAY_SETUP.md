# Google Play Store Payment Integration Setup

This document outlines the steps needed to integrate Google Play Billing for in-app purchases in the Hagion AI app.

## Prerequisites

1. **Google Play Console Account**: You must have a Google Play Developer account ($25 one-time fee)
2. **Capacitor Setup**: The app uses Capacitor for native functionality
3. **Android Studio**: Required for building and testing the Android app

## Step 1: Set Up Products in Google Play Console

1. Log in to [Google Play Console](https://play.google.com/console)
2. Select your app (or create a new one)
3. Navigate to **Monetize** → **In-app products** → **Subscriptions**
4. Create two subscription products:

### Premium Subscription
- **Product ID**: `hagion_premium_monthly`
- **Name**: Hagion AI Premium
- **Description**: Unlimited spiritual guidance and premium features
- **Price**: $9.99/month
- **Free Trial**: 3 days
- **Billing Period**: Monthly

### Premium Plus Subscription
- **Product ID**: `hagion_premium_plus_monthly`
- **Name**: Hagion AI Premium Plus
- **Description**: Premium features plus Faithful Friend app access
- **Price**: $15.99/month
- **Free Trial**: 3 days
- **Billing Period**: Monthly

## Step 2: Install Capacitor Purchase Plugin

Run this command in your project:

```bash
npm install @capgo/capacitor-purchases
npx cap sync
```

## Step 3: Configure Android Manifest

Add billing permission to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="com.android.vending.BILLING" />
```

## Step 4: Initialize Purchases in Your App

Update `src/pages/Premium.tsx` with the actual integration code:

```typescript
import { Purchases } from '@capgo/capacitor-purchases';

// Initialize on app start
await Purchases.configure({
  apiKey: 'your_revenuecat_api_key', // Optional: Use RevenueCat for easier management
});

// Handle purchase
const handlePurchase = async (productId: string) => {
  try {
    const result = await Purchases.purchaseProduct({ productId });
    if (result.success) {
      // Update user's subscription status in Supabase
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          subscription_type: productId,
          status: 'active',
          started_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Purchase failed:', error);
  }
};
```

## Step 5: Create Database Table for Subscriptions

Create a table in Supabase to track subscriptions:

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  subscription_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Step 6: Server-Side Verification (Recommended)

Create a Supabase Edge Function to verify purchases with Google Play:

```typescript
// supabase/functions/verify-purchase/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { google } from 'googleapis';

serve(async (req) => {
  const { purchaseToken, productId } = await req.json();
  
  // Verify with Google Play
  const androidPublisher = google.androidpublisher('v3');
  const result = await androidPublisher.purchases.subscriptions.get({
    packageName: 'app.lovable.491c2e4bf4f4493f88e1648be5cecac3',
    subscriptionId: productId,
    token: purchaseToken,
  });
  
  return new Response(JSON.stringify({ verified: true, data: result.data }));
});
```

## Step 7: Test the Integration

1. **Build the app**: `npm run build && npx cap sync`
2. **Open in Android Studio**: `npx cap open android`
3. **Test with Google Play Console Test Accounts**:
   - Add test accounts in Google Play Console
   - Use these accounts to test purchases without being charged

## Step 8: Handle Subscription States

Update your app to check subscription status:

```typescript
// Check if user has active subscription
const checkSubscription = async () => {
  const { data } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();
  
  return data !== null;
};
```

## Important Notes

- **Testing**: Use Google Play Console's test tracks (internal, closed, open beta) before releasing
- **Refunds**: Google Play handles refunds; implement webhook to update Supabase when refunds occur
- **Trial Period**: Free trials are automatically handled by Google Play
- **Restore Purchases**: Implement restore functionality for users who reinstall the app
- **Receipt Validation**: Always verify purchases server-side to prevent fraud

## Resources

- [Google Play Billing Documentation](https://developer.android.com/google/play/billing)
- [Capacitor Purchases Plugin](https://github.com/Cap-go/capacitor-purchases)
- [RevenueCat](https://www.revenuecat.com/) - Optional: Simplifies subscription management

## Current Status

✅ Premium page UI implemented with trial offerings
✅ Placeholder purchase handlers in place
⏳ Waiting for Google Play Console setup
⏳ Waiting for Capacitor purchases plugin integration
⏳ Waiting for server-side verification implementation
