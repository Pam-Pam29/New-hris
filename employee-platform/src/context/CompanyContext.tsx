import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company } from '../types/company';
import { CompanyService } from '../services/companyService';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

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
    const { currentEmployee, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) {
            return;
        }

        const loadCompany = async () => {
            try {
                // For employee platform, try to get company from URL params first
                const urlParams = new URLSearchParams(window.location.search);
                const companyParam = urlParams.get('company'); // Can be domain or ID

                let companyId = companyParam;

                // If no URL param, check path for company slug (e.g., /employee/:slug/setup)
                if (!companyId) {
                    const pathSegments = window.location.pathname.split('/').filter(Boolean);
                    if (pathSegments.length >= 2 && pathSegments[0] === 'employee') {
                        companyId = pathSegments[1];
                    }
                }

                // If still no identifier, try localStorage
                if (!companyId) {
                    companyId = localStorage.getItem('employeeCompanyId');
                }

                // If still missing, fall back to authenticated employee's company once auth is ready
                if (!companyId && currentEmployee?.companyId) {
                    companyId = currentEmployee.companyId;
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
                        // Avoid redundant state updates
                        if (company?.id !== companyData.id) {
                            setCompany(companyData);
                            localStorage.setItem('employeeCompanyId', companyData.id);
                            console.log('✅ [Employee] Company context loaded:', companyData.displayName);
                        }
                    } else {
                        console.warn('[Employee] Company not found or inactive:', companyId);
                        localStorage.removeItem('employeeCompanyId');
                    }
                } else if (!currentEmployee) {
                    // Only auto-load a default company when explicitly unauthenticated in development
                    if (process.env.NODE_ENV === 'development') {
                        console.log('ℹ️ [Employee] No company specified - using first active company for local development');

                        const companies = await companyService.getActiveCompanies();

                        if (companies.length > 0) {
                            const defaultCompany = companies[0];
                            setCompany(defaultCompany);
                            localStorage.setItem('employeeCompanyId', defaultCompany.id);
                            console.log('✅ [Employee] Auto-loaded first company:', defaultCompany.displayName);
                        }
                    } else {
                        console.log('ℹ️ [Employee] No company specified and no authenticated employee; leaving company unset');
                        setCompany(null);
                        localStorage.removeItem('employeeCompanyId');
                    }
                }
            } catch (error) {
                console.error('[Employee] Error loading company:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCompany();
    }, [currentEmployee?.companyId, authLoading]);

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

