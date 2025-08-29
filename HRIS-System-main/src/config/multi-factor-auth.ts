import { 
  getAuth, 
  multiFactor, 
  PhoneAuthProvider, 
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  MultiFactorUser,
  MultiFactorResolver,
  MultiFactorError
} from 'firebase/auth';

/**
 * Initializes the reCAPTCHA verifier for phone authentication
 * @param containerId The ID of the container element for reCAPTCHA
 * @returns The RecaptchaVerifier instance
 */
export function initRecaptchaVerifier(containerId: string) {
  const auth = getAuth();
  return new RecaptchaVerifier(auth, containerId, {
    size: 'normal',
    callback: () => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve reCAPTCHA again.
    }
  });
}

/**
 * Enrolls a user in multi-factor authentication using phone
 * @param phoneNumber The phone number to enroll
 * @param recaptchaVerifier The RecaptchaVerifier instance
 * @returns A promise that resolves when enrollment is complete
 */
export async function enrollPhoneMFA(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    const multiFactorUser = multiFactor(user as MultiFactorUser);
    
    // Send verification code
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    const phoneInfoOptions = {
      phoneNumber,
      session: await multiFactorUser.getSession()
    };
    
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      phoneInfoOptions, 
      recaptchaVerifier
    );
    
    return { success: true, verificationId };
  } catch (error) {
    console.error('Error enrolling in MFA:', error);
    return { success: false, error };
  }
}

/**
 * Completes the enrollment process with the verification code
 * @param verificationId The verification ID from the enrollment process
 * @param verificationCode The verification code sent to the user's phone
 * @param displayName A name for this second factor (e.g., "My Phone")
 * @returns A promise that resolves when enrollment is complete
 */
export async function completePhoneMFAEnrollment(
  verificationId: string,
  verificationCode: string,
  displayName: string
) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    const multiFactorUser = multiFactor(user as MultiFactorUser);
    
    // Create the phone auth credential
    const phoneAuthCredential = PhoneAuthProvider.credential(
      verificationId, 
      verificationCode
    );
    
    // Complete enrollment
    const credential = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
    await multiFactorUser.enroll(credential, displayName);
    
    return { success: true };
  } catch (error) {
    console.error('Error completing MFA enrollment:', error);
    return { success: false, error };
  }
}

/**
 * Handles multi-factor authentication during sign-in
 * @param error The MultiFactorError from a failed sign-in attempt
 * @param verificationCode The verification code sent to the user's phone
 * @param recaptchaVerifier The RecaptchaVerifier instance
 * @returns A promise that resolves with the sign-in result
 */
export async function handleMFASignIn(
  error: MultiFactorError,
  verificationCode: string,
  recaptchaVerifier: RecaptchaVerifier
) {
  try {
    // Get the resolver from the error
    const resolver = error.resolver as MultiFactorResolver;
    
    // Get the first hint (assuming phone is the only second factor)
    const hint = resolver.hints[0];
    
    // Send verification code
    const phoneAuthProvider = new PhoneAuthProvider(getAuth());
    const verificationId = await phoneAuthProvider.verifyPhoneNumber({
      multiFactorHint: hint,
      session: resolver.session
    }, recaptchaVerifier);
    
    // Create credential with the verification code
    const phoneAuthCredential = PhoneAuthProvider.credential(
      verificationId, 
      verificationCode
    );
    
    const credential = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
    
    // Complete sign-in
    const userCredential = await resolver.resolveSignIn(credential);
    return { success: true, userCredential };
  } catch (error) {
    console.error('Error during MFA sign-in:', error);
    return { success: false, error };
  }
}

/**
 * Gets the enrolled multi-factor methods for the current user
 * @returns A promise that resolves with the enrolled factors
 */
export async function getEnrolledFactors() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    const multiFactorUser = multiFactor(user as MultiFactorUser);
    const enrolledFactors = multiFactorUser.enrolledFactors;
    
    return { success: true, enrolledFactors };
  } catch (error) {
    console.error('Error getting enrolled factors:', error);
    return { success: false, error };
  }
}

/**
 * Unenrolls a multi-factor authentication method
 * @param factorUid The UID of the factor to unenroll
 * @returns A promise that resolves when unenrollment is complete
 */
export async function unenrollFactor(factorUid: string) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    const multiFactorUser = multiFactor(user as MultiFactorUser);
    await multiFactorUser.unenroll({ uid: factorUid });
    
    return { success: true };
  } catch (error) {
    console.error('Error unenrolling factor:', error);
    return { success: false, error };
  }
}