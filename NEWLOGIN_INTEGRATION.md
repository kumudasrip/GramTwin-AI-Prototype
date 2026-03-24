# New Login Page Integration Guide

## Components Created

1. **NewLoginPage.tsx** - Main dual-mode login component
2. **useOTPAuth.ts** - Custom hook for OTP authentication flow
3. **AuthContext.tsx** - Context for managing user role across app

## Features

### Dual-Mode Access
- **Citizen Mode**: Direct access to dashboard with read-only features
  - No authentication required
  - View map, soil/crops, infrastructure data
  - Access multilingual UI
  - Cannot edit data or generate reports

- **Organization Mode**: Full access with OTP verification
  - Form-based login with email, org type, place name
  - 6-digit OTP verification sent to email
  - Full dashboard with data editing & reports
  - Enhanced permissions

### UI/UX Features
- ✅ Green (#10B981) and Blue (#3B82F6) theme
- ✅ Smooth card-based layout with animations
- ✅ Language toggle (English / తెలుగు)
- ✅ Responsive design (mobile + desktop)
- ✅ Real-time form validation
- ✅ Loading states with spinners
- ✅ Error/success messages with icons
- ✅ Security notice at bottom
- ✅ Permissions comparison display
- ✅ OTP progress indicator

## Integration Steps

### Step 1: Wrap App with AuthProvider

```tsx
// main.tsx or index.tsx
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

export default (
  <AuthProvider>
    <App />
  </AuthProvider>
);
```

### Step 2: Import and Use in App.tsx

```tsx
import { useAuth } from './contexts/AuthContext';
import NewLoginPage from './components/NewLoginPage';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const { user, isAuthenticated, login, loginAsCitizen } = useAuth();
  const navigate = useNavigate();

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <NewLoginPage
        onCitizenLogin={() => {
          loginAsCitizen();
          navigate('/dashboard?role=citizen');
        }}
        onOrgLogin={async (email, orgType, placeName, role) => {
          login(email, orgType, placeName, role);
          navigate('/dashboard?role=org');
        }}
      />
    );
  }

  // Render main app based on role
  return (
    <div>
      {/* Your existing dashboard/app content */}
      {user.role === 'citizen' && <CitizenDashboard />}
      {user.role === 'org' && <OrgDashboard />}
    </div>
  );
}
```

### Step 3: Enforce Role-Based Permissions

```tsx
// Create a ProtectedComponent wrapper
interface ProtectedComponentProps {
  requiredRole: 'citizen' | 'org';
  children: React.ReactNode;
}

export function ProtectedComponent({ requiredRole, children }: ProtectedComponentProps) {
  const { user } = useAuth();

  if (user.role === 'citizen' && requiredRole === 'org') {
    return <div className="p-8 text-center text-gray-600">Feature available for organizations only</div>;
  }

  return <>{children}</>;
}

// Usage in components
<ProtectedComponent requiredRole="org">
  <ReportGenerator />
</ProtectedComponent>
```

## API Endpoints (Production)

The component mocks these endpoints - connect to your backend:

```typescript
// 1. Send OTP
POST /auth/org-signup
{
  email: string;
  orgType: string;
  placeName: string;
}

Response:
{
  success: boolean;
  message: string;
  otpSent?: boolean;
}

// 2. Verify OTP
POST /auth/verify-otp
{
  email: string;
  otp: string;
}

Response:
{
  success: boolean;
  message: string;
  token: string;
  user: {
    email: string;
    orgType: string;
    placeName: string;
    role: "org";
  }
}
```

## Customization

### Change Colors
Edit the Tailwind classes in NewLoginPage.tsx:
- Replace `emerald-*` with your primary color
- Replace `blue-*` with your secondary color

### Add More Languages
In NewLoginPage.tsx, add to the `translations` object:
```tsx
const translations = {
  en: { /* ... */ },
  te: { /* ... */ },
  hi: {
    'title': 'ग्रामट्विन AI',
    // Add all keys
  }
}
```

### Customize OTP Process
Extend the `useOTPAuth` hook:
```tsx
export function useOTPAuth() {
  // Add custom OTP config
  const OTP_TIMEOUT = 300; // 5 minutes
  const MAX_RETRIES = 3;
  
  // Add resend logic, rate limiting, etc.
}
```

## State Management

### Using with Context
```tsx
const { user, isAuthenticated } = useAuth();

// Check if user is authenticated
if (!isAuthenticated) {
  // Show login
}

// Check role
if (user.role === 'org') {
  // Show org features
}

// Get user details
console.log(user.email, user.orgType, user.placeName);
```

### Using with localStorage
The AuthContext automatically persists user data:
```tsx
// User data stored in localStorage as:
localStorage.getItem('gramtwin_user');
// { "role": "org", "email": "...", "orgType": "...", "placeName": "..." }
```

## Styling Reference

### Colors Used
- Primary Green: `#10B981` (emerald-500)
- Secondary Blue: `#3B82F6` (blue-500)
- Background: Gradient of emerald-50 and blue-50
- Borders: Gray-100 to Gray-200

### Responsive Breakpoints
- Mobile: `p-4` (padding)
- Desktop: `p-8` (padding)
- Max width: `max-w-2xl`

## Testing

### Test Citizen Flow
1. Click "Continue as Citizen"
2. Should redirect to dashboard with `role=citizen`
3. Verify read-only access

### Test Organization Flow
1. Click "Login as Organization"
2. Fill form (any valid email)
3. Click "Send OTP"
4. Should see "OTP sent" message
5. Enter OTP (any 6 digits except "000000")
6. Should verify and redirect to dashboard with `role=org`

### Test Language Toggle
1. Click language dropdown (top-right)
2. Select తెలుగు
3. All UI text should update
4. Verify form still works

## Production Checklist

- [ ] Connect to real `/auth/org-signup` endpoint
- [ ] Connect to real `/auth/verify-otp` endpoint
- [ ] Implement rate limiting on OTP requests
- [ ] Add email verification
- [ ] Store JWT token from backend
- [ ] Implement logout functionality
- [ ] Add "Forgot Code?" flow
- [ ] Implement OTP resend with cooldown
- [ ] Add CSRF protection
- [ ] Test on all devices
- [ ] Add error boundary around component
- [ ] Implement session timeout
- [ ] Add analytics/logging
- [ ] Migrate mock delays to real API calls

## Troubleshooting

**OTP not sending?**
- Check email is valid format
- Verify backend endpoint is running
- Check network request in browser DevTools

**User not persisting after page refresh?**
- Ensure AuthProvider wraps entire app
- Check localStorage is not disabled
- Verify AuthContext is saved before redirect

**Styles not showing?**
- Ensure Tailwind CSS is configured
- Run `npm run dev` to rebuild styles
- Check class names match Tailwind syntax

**Language not switching?**
- Verify language state updates
- Check translations object has all keys
- Ensure component re-renders after language change
