import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company } from '../types/company';
import { getCompanyService } from '../services/companyService';

interface CompanyContextType {
    company: Company | null;
    companyId: string | null;
    setCompany: (company: Company | null) => void;
    loading: boolean;
}

const CompanyContext = createContext<CompanyContextType | null>(null);

interface CompanyProviderProps {
    children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCompany = async () => {
            try {
                // Try to get company ID from localStorage (set after login)
                const storedCompanyId = localStorage.getItem('companyId');

                if (storedCompanyId) {
                    const companyService = await getCompanyService();
                    const companyData = await companyService.getCompany(storedCompanyId);

                    if (companyData && companyData.status === 'active') {
                        setCompany(companyData);
                        console.log('✅ Company context loaded:', companyData.displayName);
                    } else {
                        console.warn('Company not found or inactive:', storedCompanyId);
                        localStorage.removeItem('companyId');
                    }
                } else {
                    console.log('ℹ️ No company ID in localStorage - user needs to sign up or login');
                    // Don't auto-load any company - each user should have their own company
                    setCompany(null);
                }
            } catch (error) {
                console.error('Error loading company:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCompany();

        // Listen for localStorage changes to refresh company context
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'companyId') {
                console.log('🔄 Company ID changed in localStorage, reloading company context...');
                loadCompany();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also listen for custom events (for same-tab changes)
        const handleCustomStorageChange = () => {
            console.log('🔄 Company ID changed via custom event, reloading company context...');
            loadCompany();
        };

        window.addEventListener('companyIdChanged', handleCustomStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('companyIdChanged', handleCustomStorageChange);
        };
    }, []);

    return (
        <CompanyContext.Provider
            value={{
                company,
                companyId: company?.id || null,
                setCompany,
                loading
            }}
        >
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompany must be used within CompanyProvider');
    }
    return context;
};












