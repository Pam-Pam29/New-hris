import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company } from '../types/company';
import { CompanyService } from '../services/companyService';
import { db } from '../config/firebase';

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
                // For employee platform, try to get company from URL params first
                const urlParams = new URLSearchParams(window.location.search);
                const companyParam = urlParams.get('company'); // Can be domain or ID

                let companyId = companyParam;

                // If no URL param, try localStorage
                if (!companyId) {
                    companyId = localStorage.getItem('employeeCompanyId');
                }

                // Create CompanyService instance with employee platform's db
                const companyService = new CompanyService(db);

                if (companyId) {
                    // Try to get by ID first
                    let companyData = await companyService.getCompany(companyId);

                    // If not found, try by domain
                    if (!companyData) {
                        companyData = await companyService.getCompanyByDomain(companyId);
                    }

                    if (companyData && companyData.status === 'active') {
                        setCompany(companyData);
                        localStorage.setItem('employeeCompanyId', companyData.id);
                        console.log('✅ [Employee] Company context loaded:', companyData.displayName);
                    } else {
                        console.warn('[Employee] Company not found or inactive:', companyId);
                        localStorage.removeItem('employeeCompanyId');
                    }
                } else {
                    console.log('ℹ️ [Employee] No company specified - will use default');

                    // For development: Load first active company
                    const companies = await companyService.getActiveCompanies();

                    if (companies.length > 0) {
                        setCompany(companies[0]);
                        localStorage.setItem('employeeCompanyId', companies[0].id);
                        console.log('✅ [Employee] Auto-loaded first company:', companies[0].displayName);
                    }
                }
            } catch (error) {
                console.error('[Employee] Error loading company:', error);
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

