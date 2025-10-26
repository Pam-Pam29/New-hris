#!/bin/bash
# Script to clear all documents from Firestore collections
# This keeps the collections but removes all data

# List of collections to clear
COLLECTIONS=(
  "employees"
  "companies"
  "leaveRequests"
  "leaveTypes"
  "leaveBalances"
  "timeEntries"
  "timeTracking"
  "jobPostings"
  "recruitment_candidates"
  "interviews"
  "applications"
  "policies"
  "policyAcknowledgments"
  "assets"
  "asset_assignments"
  "maintenance_records"
  "payroll_records"
  "financial_requests"
  "performanceGoals"
  "performanceReviews"
  "schedules"
  "workSchedules"
  "shiftTemplates"
  "notifications"
  "officeLocations"
  "departments"
  "systemConfig"
  "hrUsers"
  "contracts"
  "employeeProfiles"
  "onboarding"
  "performanceMeetings"
  "starterKits"
  "assetRequests"
  "timeAdjustmentRequests"
  "attendance"
  "meetingSchedules"
  "timeNotifications"
  "activityLogs"
  "hrAvailability"
  "hrSettings"
  "employeeDashboardData"
  "documentMetadata"
)

echo "🗑️  Clearing all Firestore documents..."
echo "⚠️  This will delete ALL documents but keep the collections"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Cancelled."
  exit 0
fi

for collection in "${COLLECTIONS[@]}"
do
  echo "Deleting documents from: $collection"
  firebase firestore:delete "$collection" --all-subcollections --project hris-system-baa22
done

echo "✅ All documents cleared!"
echo "📝 Collections are still there, ready for new data"
