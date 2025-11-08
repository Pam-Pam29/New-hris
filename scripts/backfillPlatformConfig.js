/**
 * Backfill platform configuration and HR settings for each company.
 *
 * Usage:
 *   1. Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service account JSON.
 *   2. Run: node scripts/backfillPlatformConfig.js
 */

const admin = require('firebase-admin');

const DEFAULT_EMPLOYEE_PLATFORM_URL = 'https://hris-employee-platform.vercel.app';
const DEFAULT_CAREERS_PLATFORM_URL = 'https://hris-careers-platform.vercel.app';
const DEFAULT_HR_PLATFORM_URL = 'https://hr-platform.vercel.app';

function normalizeSlug(value) {
    if (!value) return '';
    return value
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

async function main() {
    if (admin.apps.length === 0) {
        admin.initializeApp();
    }

    const db = admin.firestore();

    const companiesSnapshot = await db.collection('companies').get();
    console.log(`🏢 Found ${companiesSnapshot.size} companies to inspect`);

    const legacyHrSettingsRef = db.collection('hrSettings').doc('general');
    const legacyHrSettingsSnap = await legacyHrSettingsRef.get();
    const legacyHrSettings = legacyHrSettingsSnap.exists ? legacyHrSettingsSnap.data() : {};

    for (const companyDoc of companiesSnapshot.docs) {
        const companyId = companyDoc.id;
        const companyData = companyDoc.data();
        const displayName = companyData.displayName || companyData.name || companyId;
        console.log(`\n🔍 Processing ${displayName} (${companyId})`);

        const existingSlug = companyData.settings?.employeeSlug;
        const normalizedSlug = existingSlug || normalizeSlug(companyData.domain || displayName);

        if (!existingSlug && normalizedSlug) {
            await db.collection('companies').doc(companyId).set({
                settings: {
                    employeeSlug: normalizedSlug
                }
            }, { merge: true });
            console.log(`   ✅ Added employee slug to company settings: ${normalizedSlug}`);
        }

        await backfillPlatformConfig(db, companyId, displayName);
        await backfillHrSettings(db, companyId, displayName, legacyHrSettings || {}, normalizedSlug);
    }

    console.log('\n✅ Backfill complete!');
    process.exit(0);
}

async function backfillPlatformConfig(db, companyId, displayName) {
    const docId = `platform_config_${companyId}`;
    const configRef = db.collection('systemConfig').doc(docId);
    const configSnap = await configRef.get();

    const existingData = configSnap.exists ? configSnap.data() : {};
    const updates = {};

    if (!existingData.employeePlatformUrl) {
        updates.employeePlatformUrl = DEFAULT_EMPLOYEE_PLATFORM_URL;
    }
    if (!existingData.careersPlatformUrl) {
        updates.careersPlatformUrl = DEFAULT_CAREERS_PLATFORM_URL;
    }
    if (!existingData.hrPlatformUrl) {
        updates.hrPlatformUrl = DEFAULT_HR_PLATFORM_URL;
    }

    if (Object.keys(updates).length === 0) {
        console.log(`   • Platform config already populated for ${displayName}`);
        return;
    }

    updates.companyId = companyId;
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    updates.updatedBy = 'backfill-script';

    await configRef.set(updates, { merge: true });
    console.log(`   ✅ Upserted platform config for systemConfig/${docId}`);
}

async function backfillHrSettings(db, companyId, displayName, legacyHrSettings, employeeSlug) {
    const companySettingsRef = db.collection('hrSettings').doc(companyId);
    const companySettingsSnap = await companySettingsRef.get();

    const existingData = companySettingsSnap.exists ? companySettingsSnap.data() : {};
    const updates = {
        companyId
    };

    if (legacyHrSettings.bookingPageUrl && !existingData.bookingPageUrl) {
        updates.bookingPageUrl = legacyHrSettings.bookingPageUrl;
    }
    if (legacyHrSettings.careersPortalUrl && !existingData.careersPortalUrl) {
        updates.careersPortalUrl = legacyHrSettings.careersPortalUrl;
    }
    if (legacyHrSettings.careersSlug && !existingData.careersSlug) {
        updates.careersSlug = legacyHrSettings.careersSlug;
    }

    const slugFromExistingUrl = extractSlugFromUrl(existingData.employeePortalUrl);
    const resolvedSlug = existingData.employeeSlug || employeeSlug || slugFromExistingUrl;

    if (resolvedSlug && !existingData.employeeSlug) {
        updates.employeeSlug = resolvedSlug;
    }

    if (!existingData.employeePortalUrl && resolvedSlug) {
        updates.employeePortalUrl = `${DEFAULT_EMPLOYEE_PLATFORM_URL.replace(/\/$/, '')}/employee/${resolvedSlug}`;
    }

    if (!existingData.careersPortalUrl && resolvedSlug && (existingData.careersSlug || legacyHrSettings.careersSlug)) {
        const careersSlug = existingData.careersSlug || legacyHrSettings.careersSlug;
        updates.careersPortalUrl = `${DEFAULT_CAREERS_PLATFORM_URL.replace(/\/$/, '')}/careers/${careersSlug}`;
    }

    if (Object.keys(updates).length > 1) {
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        updates.updatedBy = 'backfill-script';
        await companySettingsRef.set(updates, { merge: true });
        console.log(`   ✅ Updated hrSettings/${companyId}`);
    } else {
        console.log(`   • hrSettings/${companyId} already populated`);
    }
}

function extractSlugFromUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const match = url.match(/\/employee\/([a-z0-9-]+)/i);
    return match ? match[1].toLowerCase() : '';
}

main().catch((error) => {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
});


