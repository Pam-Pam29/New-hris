// Setup HR Booking Page URL
// Run this script to configure your Google Calendar booking page URL
// Usage: node setup-booking-page.js

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n📅 HR Booking Page Setup');
console.log('='.repeat(50));
console.log('\nThis will configure your Google Calendar booking page URL');
console.log('so employees can book meetings directly through your calendar.\n');

rl.question('Enter your Google Calendar booking page URL: ', async (bookingPageUrl) => {
    if (!bookingPageUrl || !bookingPageUrl.startsWith('https://')) {
        console.error('\n❌ Error: Please provide a valid HTTPS URL');
        rl.close();
        process.exit(1);
    }

    try {
        // Save to hrSettings collection
        await db.collection('hrSettings').doc('general').set({
            bookingPageUrl: bookingPageUrl,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: 'admin'
        }, { merge: true });

        console.log('\n✅ Success! HR Booking Page URL configured:');
        console.log(`   ${bookingPageUrl}`);
        console.log('\n📝 Employees will now see a button to open this page when');
        console.log('   scheduling meetings in Performance Management.\n');

        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error saving booking page URL:', error.message);
        rl.close();
        process.exit(1);
    }
});











