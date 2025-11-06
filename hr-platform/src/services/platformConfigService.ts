/**
 * Platform Configuration Service
 * Manages platform URLs that can change after deployment
 * Stores in Firebase for dynamic updates without redeployment
 */

import { getFirebaseDb } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface PlatformConfig {
    employeePlatformUrl: string;
    careersPlatformUrl?: string;
    hrPlatformUrl?: string;
    updatedAt?: Date;
    updatedBy?: string;
}

// Latest employee platform deployment URL (updated when redeployed)
const LATEST_EMPLOYEE_PLATFORM_URL = 'https://hris-employee-platform-jyj2hzyrp-pam-pam29s-projects.vercel.app';

const DEFAULT_CONFIG: PlatformConfig = {
    // Use environment variable if set, otherwise use latest deployment URL
    // Note: Environment variable may have old URL, so we prioritize the latest deployment
    employeePlatformUrl: import.meta.env.VITE_EMPLOYEE_PLATFORM_URL && 
        !import.meta.env.VITE_EMPLOYEE_PLATFORM_URL.includes('r27soltjn') && 
        !import.meta.env.VITE_EMPLOYEE_PLATFORM_URL.includes('1l6vdan9g') &&
        !import.meta.env.VITE_EMPLOYEE_PLATFORM_URL.includes('g3nth7u00') &&
        !import.meta.env.VITE_EMPLOYEE_PLATFORM_URL.includes('quixgtbov') &&
        !import.meta.env.VITE_EMPLOYEE_PLATFORM_URL.includes('ber5nlupd') &&
        !import.meta.env.VITE_EMPLOYEE_PLATFORM_URL.includes('qdrgvj2gi') &&
        !import.meta.env.VITE_EMPLOYEE_PLATFORM_URL.includes('jnmsjt0yx') &&
        !import.meta.env.VITE_EMPLOYEE_PLATFORM_URL.includes('de55qf2f7') &&
        !import.meta.env.VITE_EMPLOYEE_PLATFORM_URL.includes('g1fm3z66w') &&
        !import.meta.env.VITE_EMPLOYEE_PLATFORM_URL.includes('8iawzuu3i') &&
        !import.meta.env.VITE_EMPLOYEE_PLATFORM_URL.includes('oy6oson2a')
        ? import.meta.env.VITE_EMPLOYEE_PLATFORM_URL 
        : LATEST_EMPLOYEE_PLATFORM_URL,
    careersPlatformUrl: import.meta.env.VITE_CAREERS_PLATFORM_URL || '',
    hrPlatformUrl: import.meta.env.VITE_HR_PLATFORM_URL || ''
};

const CONFIG_DOC_ID = 'platform_config';
let cachedConfig: PlatformConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get platform configuration from Firebase or use defaults
 */
export async function getPlatformConfig(): Promise<PlatformConfig> {
    // Return cached config if still valid
    if (cachedConfig && Date.now() - cacheTimestamp < CACHE_DURATION) {
        return cachedConfig;
    }

    try {
        const db = getFirebaseDb();
        const configRef = doc(db, 'systemConfig', CONFIG_DOC_ID);
        const configDoc = await getDoc(configRef);

        if (configDoc.exists()) {
            const data = configDoc.data();
            let employeeUrl = data.employeePlatformUrl || DEFAULT_CONFIG.employeePlatformUrl;
            
            // Auto-update old deployment URLs to the latest one
            const oldUrls = [
                'https://hris-employee-platform-r27soltjn-pam-pam29s-projects.vercel.app',
                'https://hris-employee-platform-1l6vdan9g-pam-pam29s-projects.vercel.app',
                'https://hris-employee-platform-g3nth7u00-pam-pam29s-projects.vercel.app',
                'https://hris-employee-platform-quixgtbov-pam-pam29s-projects.vercel.app',
                'https://hris-employee-platform-ber5nlupd-pam-pam29s-projects.vercel.app',
                'https://hris-employee-platform-qdrgvj2gi-pam-pam29s-projects.vercel.app',
                'https://hris-employee-platform-jnmsjt0yx-pam-pam29s-projects.vercel.app',
                'https://hris-employee-platform-de55qf2f7-pam-pam29s-projects.vercel.app',
                'https://hris-employee-platform-g1fm3z66w-pam-pam29s-projects.vercel.app',
                'https://hris-employee-platform-8iawzuu3i-pam-pam29s-projects.vercel.app',
                'https://hris-employee-platform-oy6oson2a-pam-pam29s-projects.vercel.app'
            ];
            
            if (oldUrls.includes(employeeUrl)) {
                console.log('🔄 Updating old employee platform URL to latest deployment');
                employeeUrl = DEFAULT_CONFIG.employeePlatformUrl;
                // Auto-update in Firebase
                try {
                    const { updateDoc } = await import('firebase/firestore');
                    await updateDoc(configRef, {
                        employeePlatformUrl: employeeUrl,
                        updatedAt: new Date(),
                        updatedBy: 'auto-update'
                    });
                    console.log('✅ Auto-updated employee platform URL in Firebase');
                } catch (updateError) {
                    console.warn('⚠️ Could not auto-update URL:', updateError);
                }
            }
            
            cachedConfig = {
                employeePlatformUrl: employeeUrl,
                careersPlatformUrl: data.careersPlatformUrl || DEFAULT_CONFIG.careersPlatformUrl,
                hrPlatformUrl: data.hrPlatformUrl || DEFAULT_CONFIG.hrPlatformUrl,
                updatedAt: data.updatedAt?.toDate(),
                updatedBy: data.updatedBy
            };
            cacheTimestamp = Date.now();
            console.log('✅ Platform config loaded from Firebase:', cachedConfig);
            return cachedConfig;
        } else {
            // No config in Firebase, initialize with defaults and save them
            console.log('ℹ️ No platform config in Firebase, initializing with defaults');
            try {
                // Save default config to Firebase for future use
                const { setDoc } = await import('firebase/firestore');
                await setDoc(configRef, {
                    ...DEFAULT_CONFIG,
                    updatedAt: new Date(),
                    updatedBy: 'system-init'
                });
                console.log('✅ Initialized platform config in Firebase with defaults');
            } catch (initError) {
                console.warn('⚠️ Could not initialize platform config in Firebase:', initError);
            }
            cachedConfig = DEFAULT_CONFIG;
            cacheTimestamp = Date.now();
            return DEFAULT_CONFIG;
        }
    } catch (error: any) {
        console.error('Error loading platform config from Firebase:', error);
        if (error?.code === 'permission-denied' || error?.code === 'permission-denied') {
            console.log('⚠️ Permission denied - using default platform config (will initialize on next successful auth)');
        } else {
            console.log('⚠️ Using default platform config due to error');
        }
        // Return default config with correct URL
        cachedConfig = DEFAULT_CONFIG;
        cacheTimestamp = Date.now();
        return DEFAULT_CONFIG;
    }
}

/**
 * Update platform configuration in Firebase
 */
export async function updatePlatformConfig(config: Partial<PlatformConfig>, updatedBy?: string): Promise<void> {
    try {
        const db = getFirebaseDb();
        const configRef = doc(db, 'systemConfig', CONFIG_DOC_ID);
        const currentConfig = await getPlatformConfig();

        const updatedConfig: PlatformConfig = {
            ...currentConfig,
            ...config,
            updatedAt: new Date(),
            updatedBy: updatedBy || 'system'
        };

        await setDoc(configRef, {
            ...updatedConfig,
            updatedAt: new Date()
        }, { merge: true });

        // Clear cache to force reload
        cachedConfig = null;
        cacheTimestamp = 0;

        console.log('✅ Platform config updated in Firebase:', updatedConfig);
    } catch (error) {
        console.error('Error updating platform config:', error);
        throw error;
    }
}

/**
 * Get employee platform URL (with caching)
 */
export async function getEmployeePlatformUrl(): Promise<string> {
    const config = await getPlatformConfig();
    // Remove trailing slash if present
    const url = config.employeePlatformUrl.replace(/\/$/, '');
    console.log('🔗 [Platform Config] Employee platform URL:', url);
    return url;
}

/**
 * Get careers platform URL (with caching)
 */
export async function getCareersPlatformUrl(): Promise<string> {
    const config = await getPlatformConfig();
    return config.careersPlatformUrl?.replace(/\/$/, '') || '';
}

