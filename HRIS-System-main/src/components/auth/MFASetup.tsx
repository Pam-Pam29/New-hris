import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import {
  enrollPhoneMFA,
  completePhoneMFAEnrollment,
  getEnrolledFactors,
  unenrollFactor,
  initRecaptchaVerifier
} from '../../config/multi-factor-auth';
import { LoadingState } from '../ui/loading-state';

export function MFASetup() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [displayName, setDisplayName] = useState('My Phone');
  const [enrolledFactors, setEnrolledFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<'phone' | 'code' | 'complete'>('phone');

  // Load enrolled factors on component mount
  useEffect(() => {
    loadEnrolledFactors();
  }, []);

  const loadEnrolledFactors = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getEnrolledFactors();
      if (result.success && result.enrolledFactors) {
        setEnrolledFactors(result.enrolledFactors);
      } else {
        setError('Failed to load enrolled factors');
      }
    } catch (err) {
      setError('An error occurred while loading enrolled factors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Initialize reCAPTCHA verifier
      const recaptchaVerifier = initRecaptchaVerifier('recaptcha-container');

      // Enroll phone for MFA
      const result = await enrollPhoneMFA(phoneNumber, recaptchaVerifier);

      if (result.success && result.verificationId) {
        setVerificationId(result.verificationId);
        setStep('code');
        setSuccess('Verification code sent to your phone');
      } else {
        setError('Failed to send verification code');
      }
    } catch (err) {
      setError('An error occurred while sending verification code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Complete MFA enrollment
      const result = await completePhoneMFAEnrollment(
        verificationId,
        verificationCode,
        displayName
      );

      if (result.success) {
        setStep('complete');
        setSuccess('Multi-factor authentication enabled successfully');
        loadEnrolledFactors(); // Refresh the list
      } else {
        setError('Failed to verify code');
      }
    } catch (err) {
      setError('An error occurred while verifying code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (factorUid: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await unenrollFactor(factorUid);

      if (result.success) {
        setSuccess('Multi-factor authentication method removed');
        loadEnrolledFactors(); // Refresh the list
      } else {
        setError('Failed to remove authentication method');
      }
    } catch (err) {
      setError('An error occurred while removing authentication method');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setVerificationCode('');
    setVerificationId('');
    setDisplayName('My Phone');
    setStep('phone');
    setError(null);
    setSuccess(null);
  };

  // Check if user is signed in
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <p className="text-center text-muted-foreground">
          You must be signed in to set up multi-factor authentication.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 border rounded-lg bg-card max-w-md mx-auto">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">Multi-Factor Authentication</h2>

      <LoadingState isLoading={loading} error={error}>
        {success && (
          <div className="mb-4 p-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
            {success}
          </div>
        )}

        {/* Enrolled factors list */}
        {enrolledFactors.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Enrolled Authentication Methods</h3>
            <ul className="space-y-2">
              {enrolledFactors.map((factor) => (
                <li
                  key={factor.uid}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{factor.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {factor.phoneNumber || 'Phone authentication'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnenroll(factor.uid)}
                    className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                    disabled={loading}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Setup form */}
        {step === 'phone' && (
          <div>
            <h3 className="text-lg font-medium mb-2">Add Phone Authentication</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 555 123 4567"
                  className="w-full p-2 border rounded-md bg-background"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your phone number with country code (e.g., +1 for US)
                </p>
              </div>

              <div id="recaptcha-container"></div>

              <button
                onClick={handleSendCode}
                className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                disabled={loading}
              >
                Send Verification Code
              </button>
            </div>
          </div>
        )}

        {step === 'code' && (
          <div>
            <h3 className="text-lg font-medium mb-2">Verify Your Phone</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium mb-1">
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full p-2 border rounded-md bg-background"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                  Display Name (Optional)
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="My Phone"
                  className="w-full p-2 border rounded-md bg-background"
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setStep('phone')}
                  className="flex-1 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyCode}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  disabled={loading}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 text-green-500"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3 className="text-lg font-medium mb-2">Setup Complete</h3>
            <p className="text-muted-foreground mb-4">
              Multi-factor authentication has been successfully enabled for your account.
            </p>
            <button
              onClick={resetForm}
              className="py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Add Another Method
            </button>
          </div>
        )}
      </LoadingState>
    </div>
  );
}