// Authentication utility functions for GramTwin AI
// Handles verification codes and session management

interface AuthSession {
  organizationType: string;
  placeName: string;
  loginTime: number;
  token: string;
}

const SESSION_STORAGE_KEY = 'gramtwin_auth_session';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Generate a mock verification token
 * In production, this would validate against a backend
 */
function generateToken(organizationType: string, placeName: string): string {
  const timestamp = Date.now().toString();
  const data = `${organizationType}-${placeName}-${timestamp}`;
  // Simple token generation (in production, use actual JWT or server tokens)
  return btoa(data).substring(0, 32);
}

/**
 * Validate verification code format and logic
 * Current rules:
 * - Must be 6+ alphanumeric characters
 * - Case-insensitive
 * - No special characters allowed
 */
export function validateVerificationCode(code: string): boolean {
  if (!code || code.length < 6) {
    return false;
  }
  // Only allow alphanumeric characters
  const alphanumericRegex = /^[A-Za-z0-9]{6,}$/;
  return alphanumericRegex.test(code);
}

/**
 * Simulate server-side verification of code
 * In production, this would make an API call to verify against a database
 */
export async function verifyCode(
  organizationType: string,
  placeName: string,
  verificationCode: string
): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Validate format
  if (!validateVerificationCode(verificationCode)) {
    return false;
  }

  // Anti-spam check: Verify code format matches organization + place pattern
  // This is a simple check; production systems would use more robust validation
  const upperCode = verificationCode.toUpperCase();
  
  // Mock verification logic:
  // Accept codes that are valid alphanumeric and not in spam patterns
  const spamPatterns = [
    /^(SPAM|TEST|ADMIN|DELETE|HACK)/,
    /(.)\1{5,}/, // More than 5 repeated characters
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(upperCode)) {
      return false;
    }
  }

  // All validations passed
  return true;
}

/**
 * Create an authenticated session
 */
export function createSession(
  organizationType: string,
  placeName: string
): AuthSession {
  const session: AuthSession = {
    organizationType,
    placeName,
    loginTime: Date.now(),
    token: generateToken(organizationType, placeName),
  };
  return session;
}

/**
 * Save session to localStorage
 */
export function saveSession(session: AuthSession): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

/**
 * Get current session from localStorage
 */
export function getSession(): AuthSession | null {
  const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionData) {
    return null;
  }

  try {
    const session: AuthSession = JSON.parse(sessionData);
    
    // Check if session has expired
    const elapsed = Date.now() - session.loginTime;
    if (elapsed > SESSION_TIMEOUT) {
      clearSession();
      return null;
    }

    return session;
  } catch (err) {
    console.error('Failed to parse session:', err);
    clearSession();
    return null;
  }
}

/**
 * Clear session from storage
 */
export function clearSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Get user information from session
 */
export function getUserInfo(): {
  organizationType: string;
  placeName: string;
} | null {
  const session = getSession();
  if (!session) {
    return null;
  }
  return {
    organizationType: session.organizationType,
    placeName: session.placeName,
  };
}

/**
 * Calculate remaining session time in milliseconds
 */
export function getRemainingSessionTime(): number {
  const session = getSession();
  if (!session) {
    return 0;
  }

  const elapsed = Date.now() - session.loginTime;
  const remaining = SESSION_TIMEOUT - elapsed;
  return Math.max(0, remaining);
}

/**
 * Format remaining time as human-readable string
 */
export function formatRemainingTime(): string {
  const remaining = getRemainingSessionTime();
  if (remaining <= 0) {
    return 'Session expired';
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}
