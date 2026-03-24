import { useState } from 'react';

interface SendOTPRequest {
  email: string;
  orgType: string;
  placeName: string;
}

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    email: string;
    orgType: string;
    placeName: string;
    role: 'org' | 'citizen';
  };
}

export function useOTPAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOTP = async (data: SendOTPRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Production: Replace with actual API call
      // const response = await fetch('/api/auth/org-signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // const result = await response.json();

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simulate failure scenario (remove in production)
      if (data.email === 'error@test.com') {
        throw new Error('Failed to send OTP');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (data: VerifyOTPRequest): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      // Production: Replace with actual API call
      // const response = await fetch('/api/auth/verify-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // const result = await response.json();

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Simulate OTP validation
      if (data.otp === '000000') {
        throw new Error('Invalid OTP');
      }

      const response: AuthResponse = {
        success: true,
        message: 'OTP verified successfully',
        token: `token_${Date.now()}`,
        user: {
          email: data.email,
          orgType: 'Organization',
          placeName: 'Village',
          role: 'org',
        },
      };

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify OTP';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendOTP, verifyOTP, loading, error, setError };
}

export function useCitizenAuth() {
  const setCitizenRole = () => {
    // Store citizen role in localStorage or context
    localStorage.setItem('gramtwin_role', 'citizen');
    localStorage.setItem('gramtwin_login_time', new Date().toISOString());
  };

  return { setCitizenRole };
}
