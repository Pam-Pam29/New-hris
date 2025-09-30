import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { TypographyH2 } from "../../components/ui/typography";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useToast } from "../../hooks/use-toast";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployeeService } from "../../services/employeeService";
import { getLeaveRequestService } from "./CoreHr/LeaveManagement/services/leaveRequestService";
import FirebaseConnectionTest from "../../components/FirebaseConnectionTest";
import RealTimeSyncDemo from "../../components/RealTimeSyncDemo";
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

function useLiveStats() {
	const [loading, setLoading] = useState(true);
	const [employees, setEmployees] = useState(0);
	const [pendingLeaves, setPendingLeaves] = useState(0);
	const [openPositions] = useState(0);
	const [newHires] = useState(0);
	const [attrition] = useState("-");
	const [birthdays] = useState(0);

	useEffect(() => {
		const load = async () => {
			try {
				const empSvc = await getEmployeeService();
				const emps = await empSvc.getEmployees();
				setEmployees(emps.length);
				const leaveSvc = await getLeaveRequestService();
				const leaves = await leaveSvc.listRequests();
				setPendingLeaves(leaves.filter((l: any) => l.status === 'Pending').length);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const stats = [
		{ label: "Total Employees", value: String(employees), description: "Active employees in the company" },
		{ label: "Open Positions", value: String(openPositions), description: "Currently hiring for these roles" },
		{ label: "On Leave (Pending)", value: String(pendingLeaves), description: "Awaiting approval" },
		{ label: "New Hires", value: String(newHires), description: "New employees this month" },
		{ label: "Attrition Rate", value: String(attrition), description: "Turnover rate this year" },
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
	const { loading, stats } = useLiveStats();

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
	const { loading, stats } = useLiveStats();

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
	const activities = [
		{
			action: "Jane Doe was hired as Software Engineer",
			time: "2 hours ago",
			icon: UserPlus,
			color: "text-success"
		},
		{
			action: "Payroll processed for May",
			time: "1 day ago",
			icon: DollarSign,
			color: "text-primary"
		},
		{
			action: "John Smith approved leave request",
			time: "2 days ago",
			icon: CheckCircle,
			color: "text-warning"
		},
		{
			action: "Policy updated: Remote Work",
			time: "3 days ago",
			icon: AlertCircle,
			color: "text-info"
		}
	];

	return (
		<Card className="card-modern">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Activity className="h-5 w-5 text-primary" />
						<CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
					</div>
					<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
						View All
						<ChevronRight className="h-4 w-4 ml-1" />
					</Button>
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
	const events = [
		{
			title: "Interview: Sarah Lee",
			time: "Tomorrow, 2:00 PM",
			icon: Users,
			color: "text-primary",
			type: "Interview"
		},
		{
			title: "Company Holiday",
			time: "June 12",
			icon: Calendar,
			color: "text-success",
			type: "Holiday"
		},
		{
			title: "Birthday: Michael Brown",
			time: "Friday",
			icon: Award,
			color: "text-warning",
			type: "Birthday"
		}
	];

	return (
		<Card className="card-modern">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Bell className="h-5 w-5 text-primary" />
						<CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
					</div>
					<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
						View Calendar
						<ChevronRight className="h-4 w-4 ml-1" />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
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

const departmentData = [
	{ name: 'Engineering', value: 45, color: 'hsl(var(--primary))' },
	{ name: 'Sales', value: 25, color: 'hsl(var(--success))' },
	{ name: 'Marketing', value: 15, color: 'hsl(var(--warning))' },
	{ name: 'HR', value: 10, color: 'hsl(var(--info))' },
	{ name: 'Finance', value: 5, color: 'hsl(var(--destructive))' }
];

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
				</div>
				<div className="grid grid-cols-2 gap-2 mt-4">
					{departmentData.map((dept, i) => (
						<div key={i} className="flex items-center gap-2">
							<div
								className="w-3 h-3 rounded-full"
								style={{ backgroundColor: dept.color }}
							/>
							<span className="text-sm text-muted-foreground">{dept.name}</span>
							<span className="text-sm font-medium ml-auto">{dept.value}%</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export default function Dashboard() {
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

			{/* Firebase Connection Test */}
			<div className="mb-8">
				<FirebaseConnectionTest />
			</div>

			{/* Real-Time Sync Demo */}
			<div className="mb-8">
				<RealTimeSyncDemo />
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
