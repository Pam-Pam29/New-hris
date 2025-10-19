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
                    console.log('ℹ️ No company ID in localStorage - will use default or first company');

                    // For development: Load first active company
                    const companyService = await getCompanyService();
                    const companies = await companyService.getActiveCompanies();

                    if (companies.length > 0) {
                        setCompany(companies[0]);
                        localStorage.setItem('companyId', companies[0].id);
                        console.log('✅ Auto-loaded first company:', companies[0].displayName);
                    }
                }
            } catch (error) {
                console.error('Error loading company:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCompany();
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








