# 🔐 Supabase Authentication Fix Guide

## Problem: "Email signups are disabled"

Ye error isliye aa raha hai kyunki Supabase mein email signup disabled hai.

## ✅ Solution Steps

### Step 1: Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your project: `jssqcylbtlccwfauttnr`

### Step 2: Authentication Settings
1. Left sidebar → **Authentication**
2. Click **Settings** tab
3. Go to **General** section

### Step 3: Enable Email Signups
**User Signups Section:**
- ✅ **Enable email signups** → Turn ON
- ❌ **Enable email confirmations** → Turn OFF (for development)

**Security Section:**
- ❌ **Enable phone confirmations** → Turn OFF
- ❌ **Enable custom SMTP** → Keep OFF (use default)

### Step 4: Save Settings
1. Click **Save** button
2. Settings will be applied immediately

### Step 5: Test Again
1. Go to your live site signup page
2. Try creating account
3. Should work without "Email signups are disabled" error

## 🎯 Expected Settings

```
Authentication → Settings → General

User Signups:
☑️ Enable email signups
☐ Enable email confirmations (disabled for easy testing)

Security:
☐ Enable phone confirmations
☐ Enable custom SMTP
```

## 🧪 Testing

After enabling:
1. Visit: https://your-app.vercel.app/auth/sign-up
2. Fill signup form
3. Should create account successfully
4. User will be logged in automatically (no email confirmation needed)

## 📧 Email Confirmation (Optional)

If you want email confirmation later:
1. Enable "Enable email confirmations"
2. Configure email templates in Authentication → Templates
3. Users will need to verify email before login

## ✅ Quick Fix Summary

**Main issue:** Email signups disabled in Supabase
**Solution:** Authentication → Settings → Enable email signups ✅
**Result:** Signup will work immediately!