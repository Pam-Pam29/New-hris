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
const LATEST_EMPLOYEE_PLATFORM_URL = 'https://hris-employee-platform.vercel.app';

// Latest career platform deployment URL (updated when redeployed)
const LATEST_CAREERS_PLATFORM_URL = 'https://hris-careers-platform.vercel.app';

const DEFAULT_CONFIG: PlatformConfig = {
    // Use environment variable if set, otherwise use latest deployment URL
    // Note: Environment variable may have old URL, so we prioritize the latest deployment
    employeePlatformUrl: (() => {
        const envUrl = import.meta.env.VITE_EMPLOYEE_PLATFORM_URL?.replace(/\/$/, '');
        if (envUrl && /hris-employee-platform-[\w-]+-pam-pam29s-projects\.vercel\.app$/.test(envUrl)) {
            return LATEST_EMPLOYEE_PLATFORM_URL;
        }
        return envUrl || LATEST_EMPLOYEE_PLATFORM_URL;
    })(),
    careersPlatformUrl: (() => {
        const envUrl = import.meta.env.VITE_CAREERS_PLATFORM_URL?.replace(/\/$/, '');
        if (envUrl && /hris-careers-platform-[\w-]+-pam-pam29s-projects\.vercel\.app$/.test(envUrl)) {
            return LATEST_CAREERS_PLATFORM_URL;
        }
        return envUrl || LATEST_CAREERS_PLATFORM_URL;
    })(),
    hrPlatformUrl: import.meta.env.VITE_HR_PLATFORM_URL || ''
};

const CONFIG_DOC_ID = 'platform_config';
let cachedConfig: Map<string, PlatformConfig> = new Map();
let cacheTimestamp: Map<string, number> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get platform configuration from Firebase or use defaults
 * @param companyId - Optional company ID to get company-specific config
 */
export async function getPlatformConfig(companyId?: string): Promise<PlatformConfig> {
    const cacheKey = companyId || 'global';
    
    // Return cached config if still valid
    if (cachedConfig.has(cacheKey) && cacheTimestamp.has(cacheKey)) {
        const timestamp = cacheTimestamp.get(cacheKey)!;
        if (Date.now() - timestamp < CACHE_DURATION) {
            return cachedConfig.get(cacheKey)!;
        }
    }

    try {
        const db = getFirebaseDb();
        // Use company-specific document ID if companyId is provided
        const docId = companyId ? `platform_config_${companyId}` : CONFIG_DOC_ID;
        const configRef = doc(db, 'systemConfig', docId);
        const configDoc = await getDoc(configRef);

        if (configDoc.exists()) {
            const data = configDoc.data();
            let employeeUrl = data.employeePlatformUrl || DEFAULT_CONFIG.employeePlatformUrl;
            let careersUrl = data.careersPlatformUrl || DEFAULT_CONFIG.careersPlatformUrl;
            
            // Auto-update old employee platform deployment URLs to the latest one
            const oldEmployeeUrls = [
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
                'https://hris-employee-platform-oy6oson2a-pam-pam29s-projects.vercel.app',
                'https://hris-employee-platform-jyj2hzyrp-pam-pam29s-projects.vercel.app'
            ];
            
            // Auto-update old career platform deployment URLs to the latest one
            const oldCareersUrls = [
                'https://hris-careers-platform-41asxcdo2-pam-pam29s-projects.vercel.app',
                'https://hris-careers-platform-fox13p7b3-pam-pam29s-projects.vercel.app',
                'https://hris-careers-platform-cgnkc9kdj-pam-pam29s-projects.vercel.app'
            ];
            
            let needsUpdate = false;
            const updateData: any = {};
            
            // Check and update employee platform URL
            if (oldEmployeeUrls.includes(employeeUrl)) {
                console.log('🔄 Updating old employee platform URL to latest deployment');
                employeeUrl = DEFAULT_CONFIG.employeePlatformUrl;
                updateData.employeePlatformUrl = employeeUrl;
                needsUpdate = true;
            }
            
            // Check and update career platform URL (only if it's set and is an old URL)
            if (careersUrl && oldCareersUrls.includes(careersUrl)) {
                console.log('🔄 Updating old career platform URL to latest deployment');
                careersUrl = DEFAULT_CONFIG.careersPlatformUrl;
                updateData.careersPlatformUrl = careersUrl;
                needsUpdate = true;
            }
            
            // Auto-update in Firebase if needed
            if (needsUpdate) {
                try {
                    const { updateDoc } = await import('firebase/firestore');
                    await updateDoc(configRef, {
                        ...updateData,
                        updatedAt: new Date(),
                        updatedBy: 'auto-update'
                    });
                    console.log('✅ Auto-updated platform URLs in Firebase:', updateData);
                } catch (updateError) {
                    console.warn('⚠️ Could not auto-update URLs:', updateError);
                }
            }
            
            const config: PlatformConfig = {
                employeePlatformUrl: employeeUrl,
                careersPlatformUrl: careersUrl,
                hrPlatformUrl: data.hrPlatformUrl || DEFAULT_CONFIG.hrPlatformUrl,
                updatedAt: data.updatedAt?.toDate(),
                updatedBy: data.updatedBy
            };
            cachedConfig.set(cacheKey, config);
            cacheTimestamp.set(cacheKey, Date.now());
            console.log(`✅ Platform config loaded from Firebase${companyId ? ` for company ${companyId}` : ' (global)'}:`, config);
            return config;
        } else {
            // No config in Firebase, initialize with defaults and save them
            console.log(`ℹ️ No platform config in Firebase${companyId ? ` for company ${companyId}` : ' (global)'}, initializing with defaults`);
            try {
                // Save default config to Firebase for future use
                const { setDoc } = await import('firebase/firestore');
                await setDoc(configRef, {
                    ...DEFAULT_CONFIG,
                    companyId: companyId || null, // Store companyId for reference
                    updatedAt: new Date(),
                    updatedBy: 'system-init'
                });
                console.log(`✅ Initialized platform config in Firebase${companyId ? ` for company ${companyId}` : ' (global)'} with defaults`);
            } catch (initError) {
                console.warn('⚠️ Could not initialize platform config in Firebase:', initError);
            }
            cachedConfig.set(cacheKey, DEFAULT_CONFIG);
            cacheTimestamp.set(cacheKey, Date.now());
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
        cachedConfig.set(cacheKey, DEFAULT_CONFIG);
        cacheTimestamp.set(cacheKey, Date.now());
        return DEFAULT_CONFIG;
    }
}

/**
 * Update platform configuration in Firebase
 * @param config - Partial platform config to update
 * @param companyId - Optional company ID to update company-specific config
 * @param updatedBy - User who is updating the config
 */
export async function updatePlatformConfig(config: Partial<PlatformConfig>, companyId?: string, updatedBy?: string): Promise<void> {
    try {
        const db = getFirebaseDb();
        // Use company-specific document ID if companyId is provided
        const docId = companyId ? `platform_config_${companyId}` : CONFIG_DOC_ID;
        const configRef = doc(db, 'systemConfig', docId);
        const currentConfig = await getPlatformConfig(companyId);

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
        const cacheKey = companyId || 'global';
        cachedConfig.delete(cacheKey);
        cacheTimestamp.delete(cacheKey);

        console.log(`✅ Platform config updated in Firebase${companyId ? ` for company ${companyId}` : ' (global)'}:`, updatedConfig);
    } catch (error) {
        console.error('Error updating platform config:', error);
        throw error;
    }
}

/**
 * Get employee platform URL (with caching)
 * @param companyId - Optional company ID to get company-specific URL
 */
export async function getEmployeePlatformUrl(companyId?: string): Promise<string> {
    const config = await getPlatformConfig(companyId);
    // Remove trailing slash if present
    const url = config.employeePlatformUrl.replace(/\/$/, '');
    console.log(`🔗 [Platform Config] Employee platform URL${companyId ? ` for company ${companyId}` : ''}:`, url);
    return url;
}

/**
 * Get careers platform URL (with caching)
 * @param companyId - Optional company ID to get company-specific URL
 */
export async function getCareersPlatformUrl(companyId?: string): Promise<string> {
    const config = await getPlatformConfig(companyId);
    return config.careersPlatformUrl?.replace(/\/$/, '') || '';
}

