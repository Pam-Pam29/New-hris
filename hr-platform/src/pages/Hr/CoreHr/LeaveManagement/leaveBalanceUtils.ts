// Mock leave entitlements per employee per leave type
export interface LeaveEntitlement {
  employeeId: number;
  type: string; // leave type name
  entitled: number; // total entitled days
}

export const mockLeaveEntitlements: LeaveEntitlement[] = [
  { employeeId: 101, type: 'Annual', entitled: 20 },
  { employeeId: 101, type: 'Sick', entitled: 10 },
  { employeeId: 102, type: 'Annual', entitled: 15 },
  { employeeId: 102, type: 'Sick', entitled: 8 },
];

// Calculate leave taken for an employee and leave type
export function calculateLeaveTaken(requests: any[], employeeId: number, type: string) {
  return requests
    .filter(r => r.employeeId === employeeId && r.type === type && r.status === 'Approved')
    .reduce((sum, r) => {
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return sum + (diff > 0 ? diff : 1);
    }, 0);
}

// Get leave balance for an employee and leave type
export function getLeaveBalance(entitlements: LeaveEntitlement[], requests: any[], employeeId: number, type: string) {
  const entitlement = entitlements.find(e => e.employeeId === employeeId && e.type === type);
  if (!entitlement) return null;
  const taken = calculateLeaveTaken(requests, employeeId, type);
  return entitlement.entitled - taken;
}
