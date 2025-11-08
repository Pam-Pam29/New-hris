/**
 * Backfill platform configuration and HR settings for each company.
 *
 * Usage:
 *   1. Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service account JSON.
 *   2. Run: npx ts-node scripts/backfillPlatformConfig.ts
 *
 * The script:
 *   - Ensures every company has a document at systemConfig/platform_config_<companyId>
 *   - Moves any legacy hrSettings/general fields to hrSettings/<companyId> without deleting the source
 */

import admin from 'firebase-admin';

const DEFAULT_EMPLOYEE_PLATFORM_URL = 'https://hris-employee-platform.vercel.app';
const DEFAULT_CAREERS_PLATFORM_URL = 'https://hris-careers-platform.vercel.app';
const DEFAULT_HR_PLATFORM_URL = 'https://hr-platform.vercel.app';

async function main() {
    if (admin.apps.length === 0) {
        admin.initializeApp();
    }

    const db = admin.firestore();

    const companiesSnapshot = await db.collection('companies').get();
    console.log(`🏢 Found ${companiesSnapshot.size} companies to inspect`);

    // Load legacy hrSettings/general once (if it exists)
    const legacyHrSettingsRef = db.collection('hrSettings').doc('general');
    const legacyHrSettingsSnap = await legacyHrSettingsRef.get();
    const legacyHrSettings = legacyHrSettingsSnap.exists ? legacyHrSettingsSnap.data() : {};

    for (const companyDoc of companiesSnapshot.docs) {
        const companyId = companyDoc.id;
        const companyData = companyDoc.data();
        const displayName = companyData.displayName || companyData.name || companyId;
        console.log(`\n🔍 Processing ${displayName} (${companyId})`);

        await backfillPlatformConfig(db, companyId, displayName);
        await backfillHrSettings(db, companyId, displayName, legacyHrSettings || {});
    }

    console.log('\n✅ Backfill complete!');
    process.exit(0);
}

async function backfillPlatformConfig(
    db: FirebaseFirestore.Firestore,
    companyId: string,
    displayName: string
) {
    const docId = `platform_config_${companyId}`;
    const configRef = db.collection('systemConfig').doc(docId);
    const configSnap = await configRef.get();

    if (configSnap.exists) {
        console.log(`   • Platform config already exists for ${displayName}`);
        return;
    }

    const payload = {
        companyId,
        employeePlatformUrl: DEFAULT_EMPLOYEE_PLATFORM_URL,
        careersPlatformUrl: DEFAULT_CAREERS_PLATFORM_URL,
        hrPlatformUrl: DEFAULT_HR_PLATFORM_URL,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: 'backfill-script'
    };

    await configRef.set(payload, { merge: true });
    console.log(`   ✅ Created platform config document systemConfig/${docId}`);
}

async function backfillHrSettings(
    db: FirebaseFirestore.Firestore,
    companyId: string,
    displayName: string,
    legacyHrSettings: Record<string, any>
) {
    const companySettingsRef = db.collection('hrSettings').doc(companyId);
    const companySettingsSnap = await companySettingsRef.get();

    if (companySettingsSnap.exists) {
        console.log(`   • hrSettings/${companyId} already exists`);
        return;
    }

    const basePayload: Record<string, any> = {
        companyId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: 'backfill-script'
    };

    // Copy relevant legacy fields if they exist
    if (legacyHrSettings.bookingPageUrl) {
        basePayload.bookingPageUrl = legacyHrSettings.bookingPageUrl;
    }
    if (legacyHrSettings.careersPortalUrl) {
        basePayload.careersPortalUrl = legacyHrSettings.careersPortalUrl;
    }
    if (legacyHrSettings.careersSlug) {
        basePayload.careersSlug = legacyHrSettings.careersSlug;
    }

    await companySettingsRef.set(basePayload, { merge: true });
    console.log(`   ✅ Created hrSettings/${companyId}`);
}

main().catch((error) => {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
});


