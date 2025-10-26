# 🧪 Final Platform Testing Checklist

## Pre-Deployment Testing Plan

### Phase 1: HR Platform Testing ✅

#### Authentication & Multi-Tenancy
- [ ] Login with Travellife account (hr@travellife.com)
- [ ] Verify dashboard shows only Travellife data
- [ ] Create second company and verify data isolation

#### Core HR Functions
- [ ] Employee Management
  - [ ] Create new employee
  - [ ] Verify setup link popup appears
  - [ ] Copy and send setup link
  - [ ] Edit employee details
  - [ ] View employee profile
- [ ] Leave Management
  - [ ] View leave requests (filtered by company)
  - [ ] Approve/reject leave requests
- [ ] Time Management
  - [ ] View time entries (filtered by company)
  - [ ] Approve time entries
- [ ] Asset Management
  - [ ] View assets (filtered by company)
  - [ ] Assign assets to employees
- [ ] Policy Management
  - [ ] View policies (filtered by company)
  - [ ] Create/update policies

#### Recruitment & Hiring
- [ ] Job Board
  - [ ] Create job posting (filtered by company)
  - [ ] View job postings
- [ ] Recruitment
  - [ ] View candidates (filtered by company)
  - [ ] View interviews (filtered by company)
  - [ ] Schedule interviews

#### Payroll & Performance
- [ ] Payroll
  - [ ] View payroll records (filtered by company)
  - [ ] Process payroll
- [ ] Performance Management
  - [ ] Set goals (employee dropdown shows only company employees) ✅
  - [ ] View performance reviews
  - [ ] Schedule meetings

#### Scheduling
- [ ] Schedule Manager
  - [ ] Create work schedule (employee dropdown shows only company employees) ✅
  - [ ] View schedules (filtered by company)

---

### Phase 2: Employee Platform Testing ✅

#### Authentication
- [ ] Employee setup (using setup link from HR)
- [ ] Login with employee account

#### Employee Features
- [ ] Dashboard
  - [ ] View personal leave balances
  - [ ] View upcoming events
  - [ ] View recent activity
- [ ] Leave Management
  - [ ] Request leave
  - [ ] View leave history
- [ ] Time Tracking
  - [ ] Log time entries
  - [ ] View time history
- [ ] Payroll & Compensation
  - [ ] View payroll records
  - [ ] View financial requests
- [ ] Performance
  - [ ] View goals
  - [ ] View performance reviews
  - [ ] Schedule meetings
- [ ] Assets
  - [ ] View assigned assets
  - [ ] Request assets
- [ ] Documents
  - [ ] Upload documents
  - [ ] View documents
- [ ] Policies
  - [ ] View company policies
  - [ ] Acknowledge policies

---

### Phase 3: Careers Platform Testing ✅

#### Public Job Board
- [ ] View published jobs (all companies)
- [ ] Filter jobs by company
- [ ] Search jobs

---

### Phase 4: Multi-Tenancy Verification ✅

#### Data Isolation
- [ ] Login as Company A (Travellife)
  - [ ] Verify only Company A employees visible
  - [ ] Verify only Company A data visible across all modules
- [ ] Login as Company B
  - [ ] Verify only Company B employees visible
  - [ ] Verify only Company B data visible across all modules

#### Cross-Company Testing
- [ ] Verify Company A cannot see Company B's data
- [ ] Verify Company B cannot see Company A's data
- [ ] Verify employees cannot access other companies' data

---

### Phase 5: Edge Cases & Error Handling ✅

#### Error Scenarios
- [ ] Handle missing company ID gracefully
- [ ] Handle invalid setup tokens
- [ ] Handle expired setup links
- [ ] Handle network errors gracefully

#### Edge Cases
- [ ] Create employee without contract
- [ ] Create employee with invalid email
- [ ] Try to access unauthorized data

---

### Phase 6: Performance & Responsiveness ✅

#### Performance
- [ ] Page load times acceptable (< 3 seconds)
- [ ] Data fetching works smoothly
- [ ] Real-time updates work correctly

#### Responsiveness
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)

---

## Known Issues to Verify ✅

1. **Employee Setup Link Popup** - Should appear after contract creation
2. **Multi-Tenancy Data Filtering** - All dropdowns should show only company employees
3. **Firestore Indexes** - All queries should use indexes (no permission errors)

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passed
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All TODOs addressed
- [ ] Documentation updated

### Deployment
- [ ] Git commit all changes
- [ ] Push to GitHub
- [ ] Verify Vercel deployment successful
- [ ] Test production URLs

### Post-Deployment
- [ ] Smoke test on production
- [ ] Verify all platforms accessible
- [ ] Verify environment variables set
- [ ] Monitor for errors

---

**Test Date:** TBD
**Tested By:** TBD
**Status:** Ready for Testing
