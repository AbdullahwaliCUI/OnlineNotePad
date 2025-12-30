# Profile Feature Documentation

## Overview
The profile page allows users to view and update their personal information including full name, phone number, and WhatsApp notification preferences.

## Features Implemented

### ✅ Profile Page (`/profile`)
- **Route**: `/profile`
- **Access**: Protected route (requires authentication)
- **Functionality**: View and update user profile information

### ✅ Profile Fields
- **Full Name**: Required text field for user's complete name
- **Email**: Read-only field showing user's email address
- **Phone Number**: Optional field with E.164 format validation
- **WhatsApp Opt-in**: Checkbox for WhatsApp notification consent

### ✅ Phone Number Validation
- Uses `libphonenumber-js` for E.164 format validation
- Automatically formats phone numbers to international standard
- Validates phone numbers before saving to database
- Stores phone numbers in `phone_e164` field

### ✅ Security & Privacy
- **RLS (Row Level Security)**: Only current user can view/update their profile
- **Input Validation**: Client-side and server-side validation
- **E.164 Format**: Phone numbers stored in international format
- **Consent Management**: Explicit WhatsApp opt-in with clear description

### ✅ User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Form Validation**: Real-time validation with error messages
- **Loading States**: Shows loading indicators during operations
- **Success/Error Feedback**: Toast notifications for user actions
- **Privacy Information**: Clear privacy and security notices

### ✅ Navigation Integration
- **Navbar Dropdown**: Added profile link to user dropdown menu
- **Breadcrumb Navigation**: Easy navigation back to dashboard
- **User Menu**: Dropdown includes Dashboard, Profile Settings, and Sign Out

## Database Schema Updates

### Migration: `003_add_profile_fields.sql`
```sql
-- Added new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone_e164 TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT FALSE;

-- Added E.164 format constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT check_phone_e164_format 
CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9]\d{1,14}$');
```

## File Structure

```
src/
├── app/
│   └── profile/
│       └── page.tsx              # Profile page component
├── components/
│   ├── Navbar.tsx               # Updated with dropdown menu
│   └── ui/
│       └── PhoneInput.tsx       # Phone number input component
├── lib/
│   ├── database.ts              # Profile service functions
│   └── utils.ts                 # Phone validation utilities
├── types/
│   └── database.ts              # Updated type definitions
└── supabase/
    └── migrations/
        └── 003_add_profile_fields.sql  # Database migration
```

## API Functions

### Profile Service (`profileService`)
```typescript
// Get current user's profile
await profileService.getCurrentUserProfile()

// Update current user's profile
await profileService.updateCurrentUserProfile({
  full_name: "John Doe",
  phone_e164: "+1234567890",
  whatsapp_opt_in: true
})
```

### Phone Validation (`utils.ts`)
```typescript
// Parse and validate phone number to E.164 format
const e164Phone = parsePhoneToE164("+1 (555) 123-4567", "US")
// Returns: "+15551234567"
```

## Usage Examples

### Accessing the Profile Page
1. Sign in to your account
2. Click on your email in the navbar
3. Select "Profile Settings" from the dropdown
4. Update your information and click "Save Changes"

### Phone Number Format
- **Input**: `(555) 123-4567` or `+1 555 123 4567`
- **Stored**: `+15551234567` (E.164 format)
- **Display**: Formatted for user's locale

### WhatsApp Opt-in
- **Default**: `false` (opt-out by default)
- **Purpose**: Consent for WhatsApp notifications
- **Privacy**: Can be changed at any time
- **Compliance**: Explicit consent required

## Security Features

1. **Row Level Security**: Users can only access their own profile
2. **Input Validation**: Phone numbers validated before storage
3. **Data Encryption**: All data encrypted at rest in Supabase
4. **Audit Trail**: Profile updates logged in activity_logs table
5. **Privacy Controls**: Clear opt-in/opt-out for communications

## Testing

### Manual Testing Steps
1. **Profile Access**: Navigate to `/profile` while signed in
2. **Form Validation**: Try submitting with empty full name
3. **Phone Validation**: Enter invalid phone numbers
4. **Update Profile**: Change information and verify save
5. **Navigation**: Test dropdown menu and navigation links
6. **Responsive**: Test on different screen sizes

### Test Cases
- ✅ Profile loads with current user data
- ✅ Full name validation (required field)
- ✅ Phone number E.164 validation
- ✅ WhatsApp opt-in toggle functionality
- ✅ Save/cancel button behavior
- ✅ Error handling and user feedback
- ✅ Navigation and dropdown menu
- ✅ Responsive design on mobile/desktop

## Future Enhancements

### Potential Additions
- **Avatar Upload**: Profile picture functionality
- **Bio/Description**: Personal bio or description field
- **Notification Preferences**: Granular notification settings
- **Account Deletion**: Self-service account deletion
- **Export Data**: Download personal data
- **Two-Factor Authentication**: Enhanced security options

### Integration Opportunities
- **WhatsApp API**: Actual WhatsApp message sending
- **SMS Verification**: Phone number verification
- **Social Login**: Google/Facebook profile sync
- **Contact Import**: Import contacts for sharing