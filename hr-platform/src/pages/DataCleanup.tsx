import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, Trash2, CheckCircle } from 'lucide-react';
import { getFirebaseDb } from '../config/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

export default function DataCleanup() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const clearAllData = async () => {
        // Double confirmation
        const confirmed = window.confirm(
            '⚠️ ARE YOU ABSOLUTELY SURE?\n\n' +
            'This will DELETE ALL DATA from Firebase!\n\n' +
            '• All companies\n' +
            '• All employees\n' +
            '• All jobs\n' +
            '• All applications\n' +
            '• EVERYTHING!\n\n' +
            'Type "DELETE" in the next prompt to confirm.'
        );

        if (!confirmed) return;

        const finalConfirm = window.prompt(
            'Type DELETE (all caps) to permanently delete all data:'
        );

        if (finalConfirm !== 'DELETE') {
            alert('Cancelled. Data not deleted.');
            return;
        }

        setLoading(true);
        setSuccess(null);
        setError(null);

        const collections = [
            // Core Collections
            'companies', 'employees', 'departments',

            // Job & Recruitment
            'jobPostings', 'job_postings', 'jobApplications', 'candidates',
            'recruitment_candidates', 'interviews',

            // Leave Management
            'leaveTypes', 'leaveRequests', 'leave_requests', 'leaveBalances',

            // Time Management
            'timeEntries', 'attendance', 'attendanceRecords', 'timeNotifications',
            'timeAdjustmentRequests', 'schedules', 'shiftTemplates',

            // Payroll & Financial
            'payrollRecords', 'payroll_records', 'financial_requests',

            // Assets
            'assets', 'assetAssignments', 'assetRequests',

            // Performance
            'performanceGoals', 'performanceReviews', 'performance_reviews',
            'performanceMeetings', 'meetingSchedules',

            // Policies & HR
            'policies', 'policyAcknowledgments', 'hrSettings', 'hrAvailability',
            'starterKits',

            // Notifications & General
            'notifications', 'onboarding', 'connection-test', 'officeLocations'
        ];

        try {
            const db = getFirebaseDb();
            let totalDeleted = 0;
            const results = [];

            console.log('🧹 Starting cleanup of', collections.length, 'collections...');

            for (const collectionName of collections) {
                try {
                    const collectionRef = collection(db, collectionName);
                    const snapshot = await getDocs(collectionRef);

                    if (snapshot.empty) {
                        results.push(`📋 ${collectionName}: Already empty`);
                        console.log(`📋 ${collectionName}: Already empty`);
                        continue;
                    }

                    console.log(`🗑️  ${collectionName}: Deleting ${snapshot.size} documents...`);

                    // Delete all documents
                    for (const docSnapshot of snapshot.docs) {
                        await deleteDoc(doc(db, collectionName, docSnapshot.id));
                        totalDeleted++;
                    }

                    results.push(`✅ ${collectionName}: Deleted ${snapshot.size} documents`);
                    console.log(`✅ ${collectionName}: Deleted ${snapshot.size} documents`);
                } catch (err: any) {
                    results.push(`❌ ${collectionName}: Error - ${err.message}`);
                    console.error(`❌ ${collectionName}: Error -`, err);
                }
            }

            setSuccess(
                `🎉 Data Cleanup Complete!\n\n` +
                `Total Deleted: ${totalDeleted} documents\n\n` +
                `${results.join('\n')}\n\n` +
                `✅ All collections preserved\n` +
                `✅ Ready for fresh testing!\n\n` +
                `💡 You can now start fresh onboarding at:\n` +
                `http://localhost:3003/onboarding`
            );

            console.log(`🎉 Cleanup complete! Total deleted: ${totalDeleted} documents`);

        } catch (err: any) {
            console.error('❌ Error clearing data:', err);
            setError(`Failed to clear data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-red-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Card className="border-2 border-red-300 shadow-xl">
                    <CardHeader className="bg-red-50 border-b-2 border-red-300">
                        <CardTitle className="flex items-center gap-3 text-2xl text-red-700">
                            <Trash2 className="h-8 w-8" />
                            🧹 Data Cleanup Tool
                        </CardTitle>
                        <p className="text-red-600 mt-2">
                            Standalone cleanup page - No onboarding required
                        </p>
                    </CardHeader>

                    <CardContent className="p-8">
                        {/* Warning Box */}
                        <Alert className="border-red-400 bg-red-100 mb-6">
                            <AlertTriangle className="h-5 w-5 text-red-700" />
                            <AlertDescription className="text-red-900">
                                <strong className="text-lg">⚠️ EXTREME CAUTION REQUIRED</strong>
                                <p className="mt-2">
                                    This tool will permanently delete ALL data from Firebase across ALL platforms:
                                </p>
                                <ul className="list-disc ml-6 mt-3 space-y-1">
                                    <li><strong>HR Platform:</strong> All companies, employees, departments</li>
                                    <li><strong>Recruitment:</strong> All jobs, candidates, interviews</li>
                                    <li><strong>Leave Management:</strong> All leave types and requests</li>
                                    <li><strong>Time Tracking:</strong> All time entries and attendance</li>
                                    <li><strong>Payroll:</strong> All payroll records</li>
                                    <li><strong>Assets:</strong> All assets and assignments</li>
                                    <li><strong>Performance:</strong> All goals, reviews, meetings</li>
                                    <li><strong>Everything else!</strong></li>
                                </ul>
                                <p className="mt-3 font-bold text-red-900">
                                    ⚠️ THIS CANNOT BE UNDONE!
                                </p>
                            </AlertDescription>
                        </Alert>

                        {/* Info Box */}
                        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-2">📋 What This Tool Does:</h3>
                            <ul className="space-y-2 text-blue-800">
                                <li>✅ Deletes all documents from 40+ collections</li>
                                <li>✅ Preserves collection structures</li>
                                <li>✅ Works even without company onboarding</li>
                                <li>✅ Shows detailed progress for each collection</li>
                                <li>✅ Allows fresh start for comprehensive testing</li>
                            </ul>
                        </div>

                        {/* Collections Count */}
                        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
                            <p className="text-gray-700">
                                <strong>Collections to be cleared:</strong> 40+
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                Including: companies, employees, jobs, leave, time tracking, payroll, assets, performance, and more
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-center mb-6">
                            <Button
                                onClick={clearAllData}
                                disabled={loading}
                                variant="destructive"
                                size="lg"
                                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 text-lg"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        Clearing Data...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-6 w-6 mr-2" />
                                        🔥 Clear All Data (Dangerous!)
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Success Message */}
                        {success && (
                            <Alert className="border-green-300 bg-green-50 mb-6">
                                <CheckCircle className="h-5 w-5 text-green-700" />
                                <AlertDescription className="text-green-900 whitespace-pre-wrap font-mono text-sm">
                                    {success}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Error Message */}
                        {error && (
                            <Alert className="border-red-400 bg-red-100 mb-6">
                                <AlertTriangle className="h-5 w-5 text-red-700" />
                                <AlertDescription className="text-red-900">
                                    <strong>Error:</strong> {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Next Steps */}
                        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                            <h3 className="font-semibold text-green-900 mb-3">🚀 After Cleanup:</h3>
                            <ol className="space-y-2 text-green-800 list-decimal ml-6">
                                <li>
                                    <strong>Start Fresh Onboarding:</strong>
                                    <br />
                                    <a
                                        href="http://localhost:3003/onboarding"
                                        className="text-blue-600 hover:underline font-mono text-sm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        http://localhost:3003/onboarding
                                    </a>
                                </li>
                                <li><strong>Complete 7-step company setup</strong></li>
                                <li><strong>Add employees</strong></li>
                                <li><strong>Test all features</strong></li>
                                <li><strong>Verify real-time sync</strong></li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <div className="mt-6 text-center text-gray-600">
                    <p className="mb-2">📚 Testing Guides:</p>
                    <div className="flex gap-4 justify-center text-sm">
                        <span>• COMPLETE_ONBOARDING_FLOW_TEST.md</span>
                        <span>• TESTING_CHECKLIST.md</span>
                        <span>• COMPREHENSIVE_TESTING_GUIDE.md</span>
                    </div>
                </div>
            </div>
        </div>
    );
}











