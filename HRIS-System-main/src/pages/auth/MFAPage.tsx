import React from 'react';
import { MFASetup } from '../../components/auth/MFASetup';

export default function MFAPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Account Security</h1>
        
        <div className="mb-8">
          <p className="text-muted-foreground mb-4">
            Multi-factor authentication adds an extra layer of security to your account.
            By requiring a second form of verification in addition to your password,
            MFA helps protect your account even if your password is compromised.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 p-4 border rounded-lg bg-card">
              <h3 className="text-lg font-medium mb-2">Enhanced Security</h3>
              <p className="text-sm text-muted-foreground">
                Protect your account with an additional verification step beyond just a password.
              </p>
            </div>
            
            <div className="flex-1 p-4 border rounded-lg bg-card">
              <h3 className="text-lg font-medium mb-2">Easy to Use</h3>
              <p className="text-sm text-muted-foreground">
                Verification codes are sent directly to your phone for quick and convenient access.
              </p>
            </div>
            
            <div className="flex-1 p-4 border rounded-lg bg-card">
              <h3 className="text-lg font-medium mb-2">Account Recovery</h3>
              <p className="text-sm text-muted-foreground">
                Multiple authentication methods ensure you can always access your account.
              </p>
            </div>
          </div>
        </div>
        
        <MFASetup />
      </div>
    </div>
  );
}