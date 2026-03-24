# GramTwin AI - Login & Authentication System

## Overview
A secure login page has been implemented to prevent unauthorized access and external spam from manipulating village data. The system requires three pieces of information before accessing the application:

1. **Organization Type** - The type of organization accessing the system
2. **Place Name** - The village, district, or region being represented
3. **Verification Code** - An alphanumeric code provided by administrators

## Features

### 1. Organization Type Selection
- Dropdown menu with predefined organization types:
  - Panchayat
  - NGO
  - Government
  - Municipality
  - Research Institute
  - Private Organization
- Required field validation

### 2. Place Name Input
- Text input for village, district, or region name
- Supports any valid place name
- Helps identify which geographic area is being accessed

### 3. Verification Code Mechanism
- **Format**: 6+ alphanumeric characters (letters and numbers only)
- **Security**: 
  - Passwords are hidden visually but stored in uppercase for consistency
  - Anti-spam pattern detection prevents common spam attempts
  - Server-side validation (mocked in development, connects to real API in production)

### 4. Anti-Spam Protection
The verification code validation includes:
- **Format validation**: Only alphanumeric characters allowed
- **Length validation**: Minimum 6 characters
- **Pattern detection**: Blocks known spam patterns like:
  - "SPAM", "TEST", "ADMIN", "DELETE", "HACK"
  - More than 5 repeated characters (e.g., "AAAAAA")

### 5. Session Management
- **Storage**: Session stored in browser's sessionStorage (not persistent)
- **Session Duration**: 24 hours from login time
- **Automatic Logout**: Session expires after 24 hours
- **Session Functions**:
  - `isAuthenticated()` - Check if user is logged in
  - `getSession()` - Get current session details
  - `getUserInfo()` - Get user organization and place info
  - `clearSession()` - Clear session on logout
  - `getRemainingSessionTime()` - Get time until session expires

## File Structure

### New Files
1. **src/components/Login.tsx**
   - Main login page component
   - Handles form submission and validation
   - Displays error and success messages
   - Multi-language support

2. **src/utils/auth.ts**
   - Authentication utilities and session management
   - `verifyCode()` - Verify code against backend/database
   - `validateVerificationCode()` - Validate code format
   - `createSession()` - Create authenticated session
   - `saveSession()` / `getSession()` - Manage session storage
   - Session timeout handling

### Modified Files
1. **src/App.tsx**
   - Added authentication state management
   - Import Login component and auth utilities
   - Added `handleLogin()` function for authentication
   - Added `handleLogout()` function to clear session
   - Conditional rendering: Show Login page if not authenticated
   - Added user information display in header
   - Added logout button in navigation bar

2. **src/i18n/en.json**
   - Added login section with all English translations

3. **src/i18n/hi.json**
   - Added login section with all Hindi translations

4. **src/i18n/te.json**
   - Added login section with all Telugu translations

## Authentication Flow

```
1. User visits app → isAuthenticated() check
   ├─ TRUE → Show main dashboard
   └─ FALSE → Show Login page
   
2. User enters credentials:
   - Organization Type
   - Place Name
   - Verification Code
   
3. Form validates inputs:
   - Format validation
   - Anti-spam checks
   
4. Backend verification (mocked):
   - Simulates 800ms network delay
   - Checks against spam patterns
   - Returns success/failure
   
5. On success:
   - Create session
   - Save to sessionStorage
   - Set isLoggedIn = true
   - Redirect to main app
   
6. On failure:
   - Display error message
   - Keep on login page
   - Allow retry
```

## Language Support

All login page content is translated in:
- **English** (en)
- **Hindi** (hi) 
- **Telugu** (te)

Language can be switched from the language switcher in the login page.

### Key Login Translations

| Key | English | Hindi | Telugu |
|-----|---------|-------|--------|
| `login.organizationType` | Organization Type | संगठन का प्रकार | సంస్థ రకం |
| `login.placeName` | Place Name | स्थान का नाम | స్థల పేరు |
| `login.verificationCode` | Verification Code | सत्यापन कोड | ధృవీకరణ కోడ్ |
| `login.login` | Login | लॉगिन करें | లాగిన్ చేయండి |
| `login.securityMessage` | Protects against unauthorized access | सुरक्षित प्लेटफॉर्म | సుरక్షిత ప్ల్�-ట్‌ఫారమ్ |

## Security Implementation Notes

### Current (Development)
- Mock verification in auth.ts
- 800ms simulated delay
- Basic spam pattern detection
- Session stored in browser sessionStorage

### Production Deployment
Should implement:
1. Real backend API endpoint for code verification
2. Database of valid verification codes per organization
3. Rate limiting for failed login attempts
4. HTTPS for secure transmission
5. CSRF token protection
6. Consider moving to localStorage with encryption
7. Implement refresh token mechanism
8. Add audit logging for all login attempts

## Usage Examples

### Accessing Protected Routes
```typescript
// In any component
import { isAuthenticated, getUserInfo } from '../utils/auth';

const userInfo = getUserInfo();
if (userInfo) {
  console.log(`Logged in as: ${userInfo.organizationType}`);
  console.log(`Working in: ${userInfo.placeName}`);
}
```

### Testing Login
Example verification codes that pass validation:
- `GRAMTWIN001`
- `DEMO2025`
- `V001TEST`

Example verification codes that fail:
- `SPAM` (too short)
- `SPAMTEST` (contains spam pattern)
- `AAAAAA` (too many repeated chars)
- `test@123` (contains special characters)

## Integration with Existing Features

1. **Translation System** - All login text uses existing i18n system
2. **Village Search** - Still functional, no changes needed
3. **Dashboard** - Requires authentication to access
4. **Language Switcher** - Works on login page
5. **All Components** - Protected by authentication layer

## Error Handling

| Error | Message |
|-------|---------|
| Missing org type | "Please select an organization type" |
| Missing place name | "Please enter a place name" |
| Missing code | "Please enter a verification code" |
| Code too short | "Verification code must be at least 6 characters" |
| Invalid characters | "Verification code must contain only letters and numbers" |
| Failed verification | "Invalid verification code" |

## Future Enhancements

1. **Multi-factor Authentication** - Add SMS/email verification
2. **Role-based Access Control** - Different permissions per org type
3. **Audit Logging** - Track all logins and data access
4. **IP Whitelisting** - Restrict access by IP address
5. **Two-Factor Authentication** - Support 2FA
6. **Social Login** - Support OAuth providers
7. **Password Recovery** - Implement password reset flow
8. **Session Activity Tracking** - Log user actions during session

## Testing Checklist

- [x] Login page displays correctly
- [x] All three inputs are validated
- [x] Error messages display appropriately
- [x] Success message appears on valid submission
- [x] Language switcher works on login page
- [x] Session persists after login
- [x] Logout clears session
- [x] Cannot access app without login
- [x] Verification codes with valid formats pass
- [x] Spam patterns are rejected
- [x] App builds without errors
- [] Test on production backend API

