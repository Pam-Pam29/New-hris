export interface Company {
    id: string;
    name: string; // Internal name
    domain: string; // Unique identifier (e.g., "acme-corp")
    displayName: string; // Public display name (e.g., "Acme Corporation")

    // Branding
    logo?: string;
    primaryColor?: string; // Hex color for theming
    secondaryColor?: string;

    // Contact Information
    email: string;
    phone?: string;
    website?: string;
    address?: string;

    // Settings
    settings: {
        careersSlug: string; // URL slug (e.g., "acme" for /careers/acme)
        allowPublicApplications: boolean;
        timezone: string;
        industry?: string;
        companySize?: string;
        departments?: string[];
        onboardingCompleted?: boolean;
        onboardingCompletedAt?: string;
    };

    // Subscription
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'trial' | 'suspended';

    // Metadata
    createdAt: Date;
    updatedAt?: Date;
}

