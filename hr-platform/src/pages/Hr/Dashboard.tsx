import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { TypographyH2 } from "../../components/ui/typography";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useToast } from "../../hooks/use-toast";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployeeService } from "../../services/employeeService";
import { leaveRequestService } from "./CoreHr/LeaveManagement/services/leaveService";
import { jobBoardService } from "../../services/jobBoardService";
import { recruitmentService } from "../../services/recruitmentService";
import { useCompany } from "../../context/CompanyContext";
import {
	Users,
	UserPlus,
	Calendar,
	TrendingUp,
	TrendingDown,
	Clock,
	CheckCircle,
	AlertCircle,
	Briefcase,
	DollarSign,
	Award,
	Activity,
	Bell,
	ChevronRight,
	BarChart3,
	PieChart as PieChartIcon,
	Zap
} from 'lucide-react';

function useLiveStats(companyId: string | null) {
	const { company } = useCompany();
	const [loading, setLoading] = useState(true);
	const [employees, setEmployees] = useState(0);
	const [pendingLeaves, setPendingLeaves] = useState(0);
	const [openPositions, setOpenPositions] = useState(0);
	const [birthdays, setBirthdays] = useState(0);
	const [hiredCandidates, setHiredCandidates] = useState(0);

	useEffect(() => {
		if (!companyId) {
			console.log('⏳ Dashboard waiting for company...');
			return; // Wait for company to load
		}

		const load = async () => {
			try {
				console.log(`📊 Loading Dashboard for ${company?.displayName || 'company'}...`);

				// Load employees (filtered by company at service level)
				const empSvc = await getEmployeeService();
				const companyEmps = await empSvc.getEmployees(companyId);
				setEmployees(companyEmps.length);
				console.log(`✅ Total employees: ${companyEmps.length} for ${company?.displayName}`);

				// Calculate upcoming birthdays (this week, including today)
				const now = new Date();
				const currentYear = now.getFullYear();

				// Set to start of today (midnight)
				const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				const nextWeek = new Date(today);
				nextWeek.setDate(today.getDate() + 7);

				const birthdaysCount = companyEmps.filter((emp: any) => {
					if (emp.dob || emp.dateOfBirth || emp.personalInfo?.dateOfBirth) {
						const dobValue = emp.dob || emp.dateOfBirth || emp.personalInfo?.dateOfBirth;
						let dob: Date;

						// Parse date of birth
						if (typeof dobValue === 'object' && dobValue.toDate) {
							dob = dobValue.toDate();
						} else if (typeof dobValue === 'object' && dobValue.seconds) {
							dob = new Date(dobValue.seconds * 1000);
						} else {
							dob = new Date(dobValue);
						}

						// Debug: Show parsed DOB
						console.log(`🔍 ${emp.name}: Raw DOB =`, dobValue, `→ Parsed =`, dob, `→ Month/Day = ${dob.getMonth() + 1}/${dob.getDate()}`);

						// Get this year's birthday (reset time to midnight for accurate comparison)
						const thisYearBirthday = new Date(currentYear, dob.getMonth(), dob.getDate());
						thisYearBirthday.setHours(0, 0, 0, 0);

						// Today at midnight for comparison
						const todayMidnight = new Date(today);
						todayMidnight.setHours(0, 0, 0, 0);

						// Next week at midnight
						const nextWeekMidnight = new Date(nextWeek);
						nextWeekMidnight.setHours(0, 0, 0, 0);

						// Check if birthday is within the next 7 days (including today)
						const isBirthdayThisWeek = thisYearBirthday >= todayMidnight && thisYearBirthday <= nextWeekMidnight;

						if (isBirthdayThisWeek) {
							console.log(`🎂 Birthday THIS WEEK: ${emp.name} - ${dob.getMonth() + 1}/${dob.getDate()} (${thisYearBirthday.toDateString()})`);
						}

						return isBirthdayThisWeek;
					}
					return false;
				}).length;
				setBirthdays(birthdaysCount);
				console.log('✅ Birthdays this week (including today):', birthdaysCount);

				// Load leave requests (filter by company)
				const leaves = await leaveRequestService.getAll();
				const companyLeaves = leaves.filter((l: any) => l.companyId === companyId);

				// Debug: Show all leave statuses
				console.log('📋 Company leave requests:', companyLeaves.map((l: any) => ({
					id: l.id,
					status: l.status,
					employeeName: l.employeeName
				})));

				// Count pending leaves (case-insensitive)
				const pendingCount = companyLeaves.filter((l: any) => {
					const status = String(l.status || '').toLowerCase();
					return status === 'pending';
				}).length;

				setPendingLeaves(pendingCount);
				console.log('✅ Pending leave requests:', pendingCount, 'out of', companyLeaves.length, 'company leaves (', leaves.length, 'total)');

				// Load job postings (filter by company)
				try {
					const jobs = await jobBoardService.getJobPostings();
					const companyJobs = jobs.filter(job => job.companyId === companyId);
					const publishedJobs = companyJobs.filter(job => job.status === 'published');
					setOpenPositions(publishedJobs.length);
					console.log('✅ Open positions:', publishedJobs.length, 'of', companyJobs.length, 'company jobs (', jobs.length, 'total)');
				} catch (err) {
					console.log('⚠️ Error loading job postings, using 0');
					setOpenPositions(0);
				}

				// Load recruitment candidates (filter by company)
				try {
					const candidates = await recruitmentService.getCandidates();
					const companyCandidates = candidates.filter(c => c.companyId === companyId);
					const hired = companyCandidates.filter(c => c.status === 'hired');
					setHiredCandidates(hired.length);
					console.log('✅ Hired candidates:', hired.length, 'of', companyCandidates.length, 'company candidates (', candidates.length, 'total)');
				} catch (err) {
					console.log('⚠️ Error loading candidates, using 0');
					setHiredCandidates(0);
				}

				// Calculate department distribution for later use (case-insensitive, company-filtered)
				const departments = companyEmps.reduce((acc: any, emp: any) => {
					const dept = emp.department || 'Unassigned';
					// Capitalize first letter for consistent display
					const normalizedDept = dept.charAt(0).toUpperCase() + dept.slice(1).toLowerCase();
					acc[normalizedDept] = (acc[normalizedDept] || 0) + 1;
					return acc;
				}, {});
				console.log('✅ Department distribution (company):', departments);

			} catch (error) {
				console.error('❌ Error loading HR dashboard data:', error);
			} finally {
				setLoading(false);
				console.log('✅ HR Dashboard data loaded');
			}
		};
		load();
	}, [companyId]); // Re-run when company changes

	const stats = [
		{ label: "Total Employees", value: String(employees), description: "Active employees in the company" },
		{ label: "Open Positions", value: String(openPositions), description: "Currently hiring for these roles" },
		{ label: "Hired Candidates", value: String(hiredCandidates), description: "Successfully recruited this period" },
		{ label: "On Leave (Pending)", value: String(pendingLeaves), description: "Awaiting approval" },
		{ label: "Upcoming Birthdays", value: String(birthdays), description: "Birthdays this week" },
	];
	return { loading, stats };
}

function StatCard({
	label,
	value,
	description,
	icon: Icon,
	trend,
	trendValue,
	color = "primary"
}: {
	label: string;
	value: string;
	description: string;
	icon: any;
	trend?: "up" | "down" | "neutral";
	trendValue?: string;
	color?: "primary" | "success" | "warning" | "destructive" | "info";
}) {
	const colorClasses = {
		primary: "from-primary/5 to-primary/10 border-primary/20",
		success: "from-success/5 to-success/10 border-success/20",
		warning: "from-warning/5 to-warning/10 border-warning/20",
		destructive: "from-destructive/5 to-destructive/10 border-destructive/20",
		info: "from-info/5 to-info/10 border-info/20"
	};

	const iconColorClasses = {
		primary: "text-primary bg-primary/10",
		success: "text-success bg-success/10",
		warning: "text-warning bg-warning/10",
		destructive: "text-destructive bg-destructive/10",
		info: "text-info bg-info/10"
	};

	const valueColorClasses = {
		primary: "text-primary",
		success: "text-success",
		warning: "text-warning",
		destructive: "text-destructive",
		info: "text-info"
	};

	return (
		<Card className={`card-modern group hover:scale-105 bg-gradient-to-br ${colorClasses[color]} transition-all duration-300`}>
			<CardContent className="p-6">
				<div className="flex items-center justify-between mb-4">
					<div className={`p-3 rounded-xl ${iconColorClasses[color]} group-hover:scale-110 transition-transform`}>
						<Icon className="h-6 w-6" />
					</div>
					{trend && trendValue && (
						<div className={`flex items-center gap-1 text-sm ${trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
							}`}>
							{trend === "up" ? <TrendingUp className="h-4 w-4" /> :
								trend === "down" ? <TrendingDown className="h-4 w-4" /> :
									<Activity className="h-4 w-4" />}
							<span className="font-medium">{trendValue}</span>
						</div>
					)}
				</div>
				<div className="space-y-2">
					<p className="text-sm font-medium text-muted-foreground">{label}</p>
					<p className={`text-3xl font-bold ${valueColorClasses[color]}`}>{value}</p>
					<p className="text-xs text-muted-foreground">{description}</p>
				</div>
			</CardContent>
		</Card>
	);
}

function StatCardGroup() {
	const { companyId } = useCompany();
	const { loading, stats } = useLiveStats(companyId);

	const statConfigs = [
		{ icon: Users, color: "primary" as const, trend: "up" as const, trendValue: "+5%" },
		{ icon: Briefcase, color: "warning" as const, trend: "neutral" as const, trendValue: "3 new" },
		{ icon: Calendar, color: "info" as const, trend: "down" as const, trendValue: "-2" },
		{ icon: UserPlus, color: "success" as const, trend: "up" as const, trendValue: "+8" }
	];

	const items = loading
		? Array.from({ length: 4 }).map((_, i) => ({
			label: 'Loading...',
			value: '…',
			description: 'Fetching data...',
			...statConfigs[i]
		}))
		: stats.slice(0, 4).map((stat, i) => ({ ...stat, ...statConfigs[i] }));

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
			{items.map((stat, i) => (
				<StatCard key={i} {...stat} />
			))}
		</div>
	);
}

function ExtraStatCardGroup() {
	const { companyId } = useCompany();
	const { loading, stats } = useLiveStats(companyId);

	const statConfigs = [
		{ icon: TrendingDown, color: "destructive" as const, trend: "down" as const, trendValue: "2.1%" },
		{ icon: Award, color: "success" as const, trend: "up" as const, trendValue: "+3" },
		{ icon: Clock, color: "warning" as const, trend: "neutral" as const, trendValue: "This week" }
	];

	const items = loading
		? Array.from({ length: 3 }).map((_, i) => ({
			label: 'Loading...',
			value: '…',
			description: 'Fetching data...',
			...statConfigs[i]
		}))
		: stats.slice(4).map((stat, i) => ({ ...stat, ...statConfigs[i] }));

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 animate-fade-in">
			{items.map((stat, i) => (
				<StatCard key={i} {...stat} />
			))}
		</div>
	);
}

function QuickActions() {
	const { toast } = useToast();
	const comingSoon = (label: string) => toast({ title: `${label}`, description: "This action will be available soon.", duration: 4000 });

	const actions = [
		{
			label: "Add New Employee",
			href: "/Hr/CoreHr/EmployeeManagement",
			icon: UserPlus,
			color: "bg-success hover:bg-success/90",
			description: "Onboard new team members"
		},
		{
			label: "Post a Job",
			href: "/Hr/Hiring/JobBoard",
			icon: Briefcase,
			color: "bg-primary hover:bg-primary/90",
			description: "Create new job openings"
		},
		{
			label: "Approve Leave",
			href: "/Hr/CoreHr/LeaveManagement",
			icon: CheckCircle,
			color: "bg-warning hover:bg-warning/90",
			description: "Review pending requests"
		},
		{
			label: "Run Payroll",
			onClick: () => comingSoon("Run Payroll"),
			icon: DollarSign,
			color: "bg-secondary hover:bg-secondary/90",
			description: "Process monthly payroll"
		}
	];

	return (
		<Card className="mt-8 card-modern">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Zap className="h-5 w-5 text-primary" />
					<CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{actions.map((action, i) => (
						<div key={i}>
							{action.href ? (
								<Link to={action.href}>
									<Button className={`w-full h-auto p-4 ${action.color} text-white shadow-soft hover:shadow-soft-lg transition-all duration-200 group`}>
										<div className="flex flex-col items-center gap-2">
											<action.icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
											<div className="text-center">
												<div className="font-semibold text-sm">{action.label}</div>
												<div className="text-xs opacity-90">{action.description}</div>
											</div>
										</div>
									</Button>
								</Link>
							) : (
								<Button
									onClick={action.onClick}
									className={`w-full h-auto p-4 ${action.color} text-white shadow-soft hover:shadow-soft-lg transition-all duration-200 group`}
								>
									<div className="flex flex-col items-center gap-2">
										<action.icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
										<div className="text-center">
											<div className="font-semibold text-sm">{action.label}</div>
											<div className="text-xs opacity-90">{action.description}</div>
										</div>
									</div>
								</Button>
							)}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function RecentActivity() {
	const [activities, setActivities] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const { companyId } = useCompany();

	useEffect(() => {
		const loadActivities = async () => {
			if (!companyId) return; // Wait for company to load
			
			try {
				console.log('📋 Loading recent activities...');
				const activityList: any[] = [];

				// Load recent leave requests (filtered by company)
				const leaves = await leaveRequestService.getAll();
				const companyLeaves = leaves.filter((l: any) => l.companyId === companyId);
				console.log('📋 Leave request details:', leaves.map((l: any) => ({
					employeeName: l.employeeName,
					employeeId: l.employeeId,
					status: l.status,
					submittedDate: l.submittedDate,
					submittedAt: l.submittedAt
				})));

				// Get employees for name lookup
				const empSvcForLeave = await getEmployeeService();
				const allEmps = await empSvcForLeave.getEmployees();
				const empMap = new Map(allEmps.map((e: any) => [e.employeeId || e.firebaseId, e.name]));

				const recentLeaves = companyLeaves.slice(0, 3).map((leave: any) => {
					const status = String(leave.status || '').toLowerCase();

					// Get employee name - try multiple sources
					let employeeName = leave.employeeName;

					// If name is "Unknown Employee" or missing, look it up
					if (!employeeName || employeeName === 'Unknown Employee' || employeeName === 'undefined') {
						employeeName = empMap.get(leave.employeeId) || `Employee ${leave.employeeId || 'Unknown'}`;
					}

					let action = '';
					let icon = AlertCircle;
					let color = "text-muted-foreground";

					if (status === 'pending') {
						action = `${employeeName} submitted leave request`;
						icon = AlertCircle;
						color = "text-warning";
					} else if (status === 'approved') {
						action = `${employeeName} was approved for leave`;
						icon = CheckCircle;
						color = "text-success";
					} else if (status === 'rejected') {
						action = `${employeeName}'s leave was rejected`;
						icon = AlertCircle;
						color = "text-destructive";
					}

					// Parse submitted date
					let submittedDate = new Date();
					if (leave.submittedDate) {
						submittedDate = new Date(leave.submittedDate);
					} else if (leave.submittedAt && typeof leave.submittedAt === 'object' && leave.submittedAt.toDate) {
						submittedDate = leave.submittedAt.toDate();
					} else if (leave.submittedAt && typeof leave.submittedAt === 'object' && leave.submittedAt.seconds) {
						submittedDate = new Date(leave.submittedAt.seconds * 1000);
					} else if (leave.submittedAt) {
						submittedDate = new Date(leave.submittedAt);
					}

					return {
						action,
						time: formatTimeAgo(submittedDate),
						icon,
						color,
						timestamp: submittedDate
					};
				});
				activityList.push(...recentLeaves);

				// Load recent employees (new hires) - filtered by company
				const empSvc = await getEmployeeService();
				const emps = await empSvc.getEmployees(companyId);
				console.log('📅 Employee hire dates:', emps.map((e: any) => ({
					name: e.name,
					hireDate: e.hireDate,
					hireDateType: typeof e.hireDate,
					dateStarted: e.dateStarted
				})));

				const recentHires = emps
					.filter((emp: any) => emp.hireDate || emp.dateStarted)
					.map((emp: any) => {
						const hireDateValue = emp.hireDate || emp.dateStarted;
						let hireTimestamp: Date;

						// Handle different date formats
						if (hireDateValue && typeof hireDateValue === 'object' && hireDateValue.toDate) {
							// Firestore Timestamp
							hireTimestamp = hireDateValue.toDate();
							console.log(`🔍 ${emp.name}: Firestore Timestamp →`, hireTimestamp);
						} else if (hireDateValue && typeof hireDateValue === 'object' && hireDateValue.seconds) {
							// Firestore Timestamp object format
							hireTimestamp = new Date(hireDateValue.seconds * 1000);
							console.log(`🔍 ${emp.name}: Timestamp seconds →`, hireTimestamp);
						} else if (hireDateValue) {
							// String or other format
							hireTimestamp = new Date(hireDateValue);
							console.log(`🔍 ${emp.name}: String date "${hireDateValue}" →`, hireTimestamp);
						} else {
							// Fallback to now
							hireTimestamp = new Date();
							console.log(`🔍 ${emp.name}: No date, using now →`, hireTimestamp);
						}

						const timeAgo = formatTimeAgo(hireTimestamp);
						console.log(`⏰ ${emp.name}: Final time ago = "${timeAgo}"`);

						return {
							emp,
							hireTimestamp,
							action: `${emp.name} was hired as ${emp.role || emp.position || 'Employee'}`,
							time: timeAgo,
							icon: UserPlus,
							color: "text-success",
							timestamp: hireTimestamp
						};
					})
					.filter((item: any) => !isNaN(item.timestamp.getTime())) // Filter out invalid dates
					.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
					.slice(0, 2);

				activityList.push(...recentHires);

				// Load hired candidates
				try {
					const candidates = await recruitmentService.getCandidates();
					const recentHired = candidates
						.filter(c => c.status === 'hired')
						.slice(0, 2)
						.map((candidate: any) => ({
							action: `${candidate.name} was hired for ${candidate.position || 'a position'}`,
							time: 'Recently', // Candidates don't have hired date yet
							icon: UserPlus,
							color: "text-success",
							timestamp: new Date() // Use current time for sorting
						}));
					activityList.push(...recentHired);
					console.log('✅ Added hired candidates to activities:', recentHired.length);
				} catch (err) {
					console.log('⚠️ Error loading hired candidates for activities');
				}

				// Sort all activities by timestamp
				activityList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

				setActivities(activityList.slice(0, 4));
				console.log('✅ Loaded recent activities:', activityList.length);
			} catch (error) {
				console.error('❌ Error loading activities:', error);
				// Fallback to empty
				setActivities([]);
			} finally {
				setLoading(false);
			}
		};
		loadActivities();
	}, [companyId]);

	// Helper function to format time ago
	const formatTimeAgo = (date: Date): string => {
		// Validate date
		if (!date || isNaN(date.getTime())) {
			return 'Recently';
		}

		const now = new Date();
		const diffMs = now.getTime() - date.getTime();

		// Handle future dates
		if (diffMs < 0) {
			return 'Recently';
		}

		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
		if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
		if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;

		const diffMonths = Math.floor(diffDays / 30);
		return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
	};

	return (
		<Card className="card-modern">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Activity className="h-5 w-5 text-primary" />
					<CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{activities.map((activity, i) => (
						<div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
							<div className={`p-2 rounded-full bg-muted/50 ${activity.color}`}>
								<activity.icon className="h-4 w-4" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-foreground">{activity.action}</p>
								<p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function UpcomingEvents() {
	const [events, setEvents] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadEvents = async () => {
			try {
				console.log('📅 Loading upcoming events...');
				const eventList: any[] = [];

				const today = new Date();

				// Load performance meetings (HR meetings)
				try {
					const { collection, getDocs, query, where } = await import('firebase/firestore');
					const { getFirebaseDb } = await import('../../config/firebase');
					const db = getFirebaseDb();

					// Get all non-cancelled meetings
					const q = query(
						collection(db, 'performanceMeetings'),
						where('status', 'in', ['pending', 'approved', 'confirmed'])
					);
					const snapshot = await getDocs(q);

					const upcomingMeetings = snapshot.docs
						.map((doc: any) => {
							const data = doc.data();
							let meetingDate: Date;

							// Parse Firestore Timestamp
							if (data.scheduledDate && typeof data.scheduledDate === 'object' && data.scheduledDate.toDate) {
								meetingDate = data.scheduledDate.toDate();
							} else if (data.scheduledDate) {
								meetingDate = new Date(data.scheduledDate);
							} else {
								return null;
							}

							return {
								data,
								meetingDate,
								id: doc.id
							};
						})
						.filter((item: any) => item && item.meetingDate >= today)
						.slice(0, 3)
						.map((item: any) => {
							const { data, meetingDate } = item;
							const daysDiff = Math.floor((meetingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

							let timeText = '';
							if (daysDiff === 0) {
								timeText = 'Today';
							} else if (daysDiff === 1) {
								timeText = 'Tomorrow';
							} else if (daysDiff <= 7) {
								timeText = meetingDate.toLocaleDateString('en-US', { weekday: 'long' });
							} else {
								timeText = meetingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
							}

							const time = meetingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

							// Format meeting type nicely
							const meetingTypeDisplay = (data.meetingType || 'meeting')
								.replace(/_/g, ' ')
								.replace(/\b\w/g, (l: string) => l.toUpperCase());

							return {
								title: `${meetingTypeDisplay}: ${data.employeeName || 'Employee'}`,
								time: `${timeText}, ${time}`,
								icon: Clock,
								color: "text-info",
								type: "Meeting",
								timestamp: meetingDate
							};
						});
					eventList.push(...upcomingMeetings);
					console.log('✅ Upcoming HR meetings:', upcomingMeetings.length);
				} catch (err) {
					console.log('⚠️ No upcoming HR meetings');
				}

				// Load recruitment interviews
				try {
					const interviews = await recruitmentService.getInterviews();
					console.log('🎤 All interviews loaded:', interviews.length);
					console.log('🎤 Interview details:', interviews.map((i: any) => ({
						id: i.id,
						candidateName: i.candidateName,
						candidateId: i.candidateId,
						scheduledTime: i.scheduledTime,
						status: i.status
					})));

					// Get candidates for name lookup
					const candidates = await recruitmentService.getCandidates();
					const candidateMap = new Map(candidates.map((c: any) => [c.id, c.name]));

					const upcomingInterviews = interviews
						.filter((interview: any) => {
							// Filter out cancelled interviews
							if (interview.status === 'cancelled') {
								return false;
							}

							if (!interview.scheduledTime) {
								console.log(`⚠️ Interview ${interview.id} has no scheduledTime`);
								return false;
							}

							let interviewDate: Date;
							if (typeof interview.scheduledTime === 'object' && interview.scheduledTime.toDate) {
								interviewDate = interview.scheduledTime.toDate();
							} else if (typeof interview.scheduledTime === 'object' && interview.scheduledTime.seconds) {
								interviewDate = new Date(interview.scheduledTime.seconds * 1000);
							} else {
								interviewDate = new Date(interview.scheduledTime);
							}

							const isFuture = interviewDate >= today;
							const candidateName = candidateMap.get(interview.candidateId) || 'Candidate';
							console.log(`🎤 Interview ${candidateName}: ${interviewDate.toLocaleString()} - Future? ${isFuture}`);
							return isFuture;
						})
						.slice(0, 3)
						.map((interview: any) => {
							let interviewDate: Date;
							if (typeof interview.scheduledTime === 'object' && interview.scheduledTime.toDate) {
								interviewDate = interview.scheduledTime.toDate();
							} else if (typeof interview.scheduledTime === 'object' && interview.scheduledTime.seconds) {
								interviewDate = new Date(interview.scheduledTime.seconds * 1000);
							} else {
								interviewDate = new Date(interview.scheduledTime);
							}

							const daysDiff = Math.floor((interviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

							let timeText = '';
							if (daysDiff === 0) {
								timeText = 'Today';
							} else if (daysDiff === 1) {
								timeText = 'Tomorrow';
							} else if (daysDiff <= 7) {
								timeText = interviewDate.toLocaleDateString('en-US', { weekday: 'long' });
							} else {
								timeText = interviewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
							}

							const time = interviewDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

							// Look up candidate name
							const candidateName = candidateMap.get(interview.candidateId) || 'Candidate';

							return {
								title: `Interview: ${candidateName}`,
								time: `${timeText}, ${time}`,
								icon: Users,
								color: "text-primary",
								type: "Interview",
								timestamp: interviewDate
							};
						});
					eventList.push(...upcomingInterviews);
					console.log('✅ Upcoming recruitment interviews:', upcomingInterviews.length);
				} catch (err) {
					console.error('❌ Error loading recruitment interviews:', err);
				}

				// Load upcoming birthdays
				try {
					const empSvc = await getEmployeeService();
					const emps = await empSvc.getEmployees();
					const now = new Date();
					const currentYear = now.getFullYear();

					// Set to start of today (midnight)
					const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
					const nextWeek = new Date(today);
					nextWeek.setDate(today.getDate() + 7);

					const upcomingBirthdays = emps
						.filter((emp: any) => {
							if (emp.dob || emp.dateOfBirth || emp.personalInfo?.dateOfBirth) {
								const dobValue = emp.dob || emp.dateOfBirth || emp.personalInfo?.dateOfBirth;
								let dob: Date;

								if (typeof dobValue === 'object' && dobValue.toDate) {
									dob = dobValue.toDate();
								} else if (typeof dobValue === 'object' && dobValue.seconds) {
									dob = new Date(dobValue.seconds * 1000);
								} else {
									dob = new Date(dobValue);
								}

								console.log(`🎂 Events - ${emp.name}: DOB raw =`, dobValue, `parsed month/day = ${dob.getMonth() + 1}/${dob.getDate()}`);

								const thisYearBirthday = new Date(currentYear, dob.getMonth(), dob.getDate());
								thisYearBirthday.setHours(0, 0, 0, 0);

								const todayMidnight = new Date(today);
								todayMidnight.setHours(0, 0, 0, 0);

								const nextWeekMidnight = new Date(nextWeek);
								nextWeekMidnight.setHours(0, 0, 0, 0);

								return thisYearBirthday >= todayMidnight && thisYearBirthday <= nextWeekMidnight;
							}
							return false;
						})
						.map((emp: any) => {
							const dobValue = emp.dob || emp.dateOfBirth || emp.personalInfo?.dateOfBirth;
							let dob: Date;

							if (typeof dobValue === 'object' && dobValue.toDate) {
								dob = dobValue.toDate();
							} else if (typeof dobValue === 'object' && dobValue.seconds) {
								dob = new Date(dobValue.seconds * 1000);
							} else {
								dob = new Date(dobValue);
							}

							const thisYearBirthday = new Date(currentYear, dob.getMonth(), dob.getDate());
							thisYearBirthday.setHours(0, 0, 0, 0);

							const todayMidnight = new Date(today);
							todayMidnight.setHours(0, 0, 0, 0);

							const daysDiff = Math.floor((thisYearBirthday.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

							let timeText = '';
							if (daysDiff === 0) {
								timeText = 'Today';
							} else if (daysDiff === 1) {
								timeText = 'Tomorrow';
							} else {
								timeText = thisYearBirthday.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
							}

							console.log(`🎂 Event display: ${emp.name} birthday is ${daysDiff} days away (${timeText})`);

							return {
								title: `Birthday: ${emp.name}`,
								time: timeText,
								icon: Award,
								color: "text-warning",
								type: "Birthday",
								timestamp: thisYearBirthday
							};
						});
					eventList.push(...upcomingBirthdays);
					console.log('✅ Upcoming birthdays for events:', upcomingBirthdays.length);
				} catch (err) {
					console.log('⚠️ Error loading birthdays for events');
				}

				// TODO: Add company holidays when holidays collection is created
				// Example: Load from 'company_holidays' collection
				// const holidays = await getHolidays();
				// eventList.push(...holidays.map(h => ({ title: h.name, time: formatDate(h.date), icon: Calendar, type: "Holiday" })));

				// Sort by timestamp (earliest first)
				eventList.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

				setEvents(eventList.slice(0, 5)); // Show top 5 upcoming events
				console.log('✅ Total upcoming events:', eventList.length);
			} catch (error) {
				console.error('❌ Error loading events:', error);
				setEvents([]);
			} finally {
				setLoading(false);
			}
		};
		loadEvents();
	}, []);

	return (
		<Card className="card-modern">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Bell className="h-5 w-5 text-primary" />
					<CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
				</div>
				<p className="text-sm text-muted-foreground mt-2">
					Interviews, birthdays, holidays, and HR meetings
				</p>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : events.length > 0 ? (
					<div className="space-y-4">
						{events.map((event, i) => (
							<div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
								<div className={`p-2 rounded-full bg-muted/50 ${event.color}`}>
									<event.icon className="h-4 w-4" />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<p className="text-sm font-medium text-foreground">{event.title}</p>
										<span className={`text-xs px-2 py-1 rounded-full bg-muted/50 ${event.color}`}>
											{event.type}
										</span>
									</div>
									<p className="text-xs text-muted-foreground">{event.time}</p>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
						<Calendar className="h-12 w-12 mb-3 opacity-50" />
						<p>No upcoming events</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// Dummy data for charts
const headcountData = [
	{ month: 'Jan', employees: 95, target: 100 },
	{ month: 'Feb', employees: 102, target: 105 },
	{ month: 'Mar', employees: 108, target: 110 },
	{ month: 'Apr', employees: 115, target: 115 },
	{ month: 'May', employees: 118, target: 120 },
	{ month: 'Jun', employees: 120, target: 125 },
];

// Department data will be calculated from real employees in the component

function HeadcountTrendChart() {
	return (
		<Card className="card-modern">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5 text-primary" />
						<CardTitle className="text-lg font-semibold">Headcount Trend</CardTitle>
					</div>
					<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
						View Details
						<ChevronRight className="h-4 w-4 ml-1" />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="h-80 w-full">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={headcountData}>
							<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
							<XAxis
								dataKey="month"
								axisLine={false}
								tickLine={false}
								tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: 'hsl(var(--card))',
									border: '1px solid hsl(var(--border))',
									borderRadius: '8px',
									boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
								}}
							/>
							<Line
								type="monotone"
								dataKey="employees"
								stroke="hsl(var(--primary))"
								strokeWidth={3}
								dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
								activeDot={{ r: 8, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
							/>
							<Line
								type="monotone"
								dataKey="target"
								stroke="hsl(var(--muted-foreground))"
								strokeWidth={2}
								strokeDasharray="5 5"
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}

function DepartmentDistribution() {
	const [departmentData, setDepartmentData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadDepartmentData = async () => {
			try {
				console.log('📊 Loading department distribution...');
				const empSvc = await getEmployeeService();
				const emps = await empSvc.getEmployees();

				// Calculate department distribution (case-insensitive)
				const deptCounts = emps.reduce((acc: any, emp: any) => {
					const dept = emp.department || 'Unassigned';
					// Capitalize first letter for consistent display
					const normalizedDept = dept.charAt(0).toUpperCase() + dept.slice(1).toLowerCase();
					acc[normalizedDept] = (acc[normalizedDept] || 0) + 1;
					return acc;
				}, {});

				// Convert to chart data with colors
				const colors = [
					'hsl(var(--primary))',
					'hsl(var(--success))',
					'hsl(var(--warning))',
					'hsl(var(--info))',
					'hsl(var(--destructive))',
					'#8884d8',
					'#82ca9d',
					'#ffc658'
				];

				const chartData = Object.entries(deptCounts)
					.map(([name, count], index) => ({
						name,
						value: count as number,
						color: colors[index % colors.length]
					}))
					.sort((a, b) => b.value - a.value); // Sort by count descending

				setDepartmentData(chartData);
				console.log('✅ Department distribution:', chartData);
			} catch (error) {
				console.error('❌ Error loading department data:', error);
				setDepartmentData([]);
			} finally {
				setLoading(false);
			}
		};
		loadDepartmentData();
	}, []);

	return (
		<Card className="card-modern">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<PieChartIcon className="h-5 w-5 text-primary" />
						<CardTitle className="text-lg font-semibold">Department Distribution</CardTitle>
					</div>
					<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
						View All
						<ChevronRight className="h-4 w-4 ml-1" />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="h-80 w-full">
					{loading ? (
						<div className="flex items-center justify-center h-full">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
						</div>
					) : departmentData.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={departmentData}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={120}
									paddingAngle={5}
									dataKey="value"
									label={(entry) => `${entry.name}: ${entry.value}`}
								>
									{departmentData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: 'hsl(var(--card))',
										border: '1px solid hsl(var(--border))',
										borderRadius: '8px',
										boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					) : (
						<div className="flex items-center justify-center h-full text-muted-foreground">
							<p>No department data available</p>
						</div>
					)}
				</div>
				{!loading && departmentData.length > 0 && (
					<div className="grid grid-cols-2 gap-2 mt-4">
						{departmentData.map((dept, i) => (
							<div key={i} className="flex items-center gap-2">
								<div
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: dept.color }}
								/>
								<span className="text-sm text-muted-foreground">{dept.name}</span>
								<span className="text-sm font-medium ml-auto">{dept.value}</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default function Dashboard() {
	const { companyId, company } = useCompany();
	const currentTime = new Date().toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	});
	const currentDate = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	return (
		<div className="p-8 min-h-screen animate-fade-in">
			{/* Header */}
			<div className="mb-8 animate-slide-in">
				<div className="flex items-center justify-between mb-2">
					<div>
						<h1 className="text-4xl font-bold text-gradient mb-2">
							Welcome to HR Dashboard
						</h1>
						<p className="text-muted-foreground text-lg">
							Manage your workforce efficiently and effectively
						</p>
					</div>
					<div className="text-right">
						<p className="text-2xl font-bold text-primary">{currentTime}</p>
						<p className="text-sm text-muted-foreground">{currentDate}</p>
					</div>
				</div>
			</div>

			{/* Stats */}
			<StatCardGroup />
			<ExtraStatCardGroup />

			{/* Quick Actions */}
			<QuickActions />

			{/* Activity and Events */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
				<RecentActivity />
				<UpcomingEvents />
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
				<HeadcountTrendChart />
				<DepartmentDistribution />
			</div>
		</div>
	);
}
