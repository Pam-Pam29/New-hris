import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MFASetup } from './MFASetup';
import * as multiFactorAuth from '../../config/multi-factor-auth';
import { getAuth } from 'firebase/auth';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

// Mock multi-factor-auth module
jest.mock('../../config/multi-factor-auth', () => ({
  enrollPhoneMFA: jest.fn(),
  completePhoneMFAEnrollment: jest.fn(),
  getEnrolledFactors: jest.fn(),
  unenrollFactor: jest.fn(),
  initRecaptchaVerifier: jest.fn(),
}));

describe('MFASetup Component', () => {
  // Setup mocks before each test
  beforeEach(() => {
    // Mock auth.currentUser
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'test-user-id' },
    });

    // Mock getEnrolledFactors to return empty array by default
    (multiFactorAuth.getEnrolledFactors as jest.Mock).mockResolvedValue({
      success: true,
      enrolledFactors: [],
    });

    // Mock initRecaptchaVerifier
    (multiFactorAuth.initRecaptchaVerifier as jest.Mock).mockReturnValue({
      clear: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders sign-in message when user is not authenticated', () => {
    // Mock user not signed in
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: null,
    });

    render(<MFASetup />);
    
    expect(screen.getByText('You must be signed in to set up multi-factor authentication.')).toBeInTheDocument();
  });

  test('renders MFA setup form when user is authenticated', async () => {
    render(<MFASetup />);
    
    // Wait for enrolled factors to load
    await waitFor(() => {
      expect(multiFactorAuth.getEnrolledFactors).toHaveBeenCalled();
    });

    expect(screen.getByText('Multi-Factor Authentication')).toBeInTheDocument();
    expect(screen.getByText('Add Phone Authentication')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
  });

  test('shows enrolled factors when they exist', async () => {
    // Mock enrolled factors
    (multiFactorAuth.getEnrolledFactors as jest.Mock).mockResolvedValue({
      success: true,
      enrolledFactors: [
        { uid: 'factor1', displayName: 'My Phone', phoneNumber: '+1234567890' },
      ],
    });

    render(<MFASetup />);
    
    // Wait for enrolled factors to load
    await waitFor(() => {
      expect(screen.getByText('Enrolled Authentication Methods')).toBeInTheDocument();
    });

    expect(screen.getByText('My Phone')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
  });

  test('handles phone verification flow', async () => {
    // Mock successful verification code sending
    (multiFactorAuth.enrollPhoneMFA as jest.Mock).mockResolvedValue({
      success: true,
      verificationId: 'test-verification-id',
    });

    render(<MFASetup />);
    
    // Enter phone number and send code
    const phoneInput = screen.getByLabelText('Phone Number');
    fireEvent.change(phoneInput, { target: { value: '+1234567890' } });
    
    const sendButton = screen.getByText('Send Verification Code');
    fireEvent.click(sendButton);
    
    // Wait for verification code to be sent
    await waitFor(() => {
      expect(multiFactorAuth.enrollPhoneMFA).toHaveBeenCalledWith(
        '+1234567890',
        expect.anything()
      );
    });

    // Verify we moved to the code verification step
    await waitFor(() => {
      expect(screen.getByText('Verify Your Phone')).toBeInTheDocument();
    });
  });

  test('handles verification code submission', async () => {
    // Setup for verification code step
    (multiFactorAuth.enrollPhoneMFA as jest.Mock).mockResolvedValue({
      success: true,
      verificationId: 'test-verification-id',
    });

    // Mock successful MFA enrollment completion
    (multiFactorAuth.completePhoneMFAEnrollment as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(<MFASetup />);
    
    // Enter phone number and send code
    const phoneInput = screen.getByLabelText('Phone Number');
    fireEvent.change(phoneInput, { target: { value: '+1234567890' } });
    
    const sendButton = screen.getByText('Send Verification Code');
    fireEvent.click(sendButton);
    
    // Wait for verification code to be sent
    await waitFor(() => {
      expect(screen.getByText('Verify Your Phone')).toBeInTheDocument();
    });

    // Enter verification code
    const codeInput = screen.getByLabelText('Verification Code');
    fireEvent.change(codeInput, { target: { value: '123456' } });
    
    // Submit verification code
    const verifyButton = screen.getByText('Verify');
    fireEvent.click(verifyButton);
    
    // Wait for verification to complete
    await waitFor(() => {
      expect(multiFactorAuth.completePhoneMFAEnrollment).toHaveBeenCalledWith(
        'test-verification-id',
        '123456',
        'My Phone'
      );
    });

    // Verify we moved to the completion step
    await waitFor(() => {
      expect(screen.getByText('Setup Complete')).toBeInTheDocument();
    });
  });

  test('handles unenrolling a factor', async () => {
    // Mock enrolled factors
    (multiFactorAuth.getEnrolledFactors as jest.Mock).mockResolvedValue({
      success: true,
      enrolledFactors: [
        { uid: 'factor1', displayName: 'My Phone', phoneNumber: '+1234567890' },
      ],
    });

    // Mock successful unenrollment
    (multiFactorAuth.unenrollFactor as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(<MFASetup />);
    
    // Wait for enrolled factors to load
    await waitFor(() => {
      expect(screen.getByText('Enrolled Authentication Methods')).toBeInTheDocument();
    });

    // Click remove button
    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);
    
    // Wait for unenrollment to complete
    await waitFor(() => {
      expect(multiFactorAuth.unenrollFactor).toHaveBeenCalledWith('factor1');
    });

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText('Multi-factor authentication method removed')).toBeInTheDocument();
    });
  });

  test('handles errors during enrollment', async () => {
    // Mock error during verification code sending
    (multiFactorAuth.enrollPhoneMFA as jest.Mock).mockRejectedValue(
      new Error('Failed to send verification code')
    );

    render(<MFASetup />);
    
    // Enter phone number and send code
    const phoneInput = screen.getByLabelText('Phone Number');
    fireEvent.change(phoneInput, { target: { value: '+1234567890' } });
    
    const sendButton = screen.getByText('Send Verification Code');
    fireEvent.click(sendButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('An error occurred while sending verification code')).toBeInTheDocument();
    });
  });
});