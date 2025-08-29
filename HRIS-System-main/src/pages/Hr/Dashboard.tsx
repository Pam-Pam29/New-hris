import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { TypographyH2 } from "../../components/ui/typography";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
	{
		label: "Total Employees",
		value: "120",
		description: "Active employees in the company",
	},
	{
		label: "Open Positions",
		value: "8",
		description: "Currently hiring for these roles",
	},
	{
		label: "Payroll (This Month)",
		value: "$50,000",
		description: "Total payroll processed",
	},
	{
		label: "On Leave",
		value: "5",
		description: "Employees currently on leave",
	},
	{
		label: "New Hires",
		value: "3",
		description: "New employees this month",
	},
	{
		label: "Attrition Rate",
		value: "2.5%",
		description: "Turnover rate this year",
	},
	{
		label: "Upcoming Birthdays",
		value: "2",
		description: "Birthdays this week",
	},
];

function StatCard({ label, value, description }: { label: string; value: string; description: string }) {
	return (
		<Card className="w-full shadow-sm bg-card text-card-foreground hover:shadow-md transition-shadow">
			<CardHeader className="pb-2">
				<CardTitle className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">{label}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{value}</div>
				<div className="text-[10px] sm:text-xs text-muted-foreground">{description}</div>
			</CardContent>
		</Card>
	);
}

function StatCardGroup() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
			{stats.slice(0, 4).map((stat) => (
				<StatCard key={stat.label} {...stat} />
			))}
		</div>
	);
}

function ExtraStatCardGroup() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6">
			{stats.slice(4).map((stat) => (
				<StatCard key={stat.label} {...stat} />
			))}
		</div>
	);
}

function QuickActions() {
	return (
		<div className="flex flex-wrap gap-2 md:gap-3 mt-6 md:mt-8">
			<Button className="bg-green-500 hover:bg-green-600 text-white text-xs md:text-sm px-3 py-1 h-auto">Add New Employee</Button>
			<Button className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm px-3 py-1 h-auto">Post a Job</Button>
			<Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm px-3 py-1 h-auto">Approve Leave</Button>
			<Button
                className="bg-violet-600 text-white hover:bg-violet-700 text-xs md:text-sm px-3 py-1 h-auto"
                variant="outline"
            >
                Run Payroll
            </Button>
		</div>
	);
}

function RecentActivity() {
	return (
		<Card className="w-full md:w-1/2 mt-8 overflow-hidden">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm md:text-base font-medium">Recent Activity</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="text-xs md:text-sm text-muted-foreground space-y-3">
					<li className="p-1 hover:bg-accent/20 rounded-md transition-colors">Jane Doe was hired as Software Engineer</li>
					<li className="p-1 hover:bg-accent/20 rounded-md transition-colors">Payroll processed for May</li>
					<li className="p-1 hover:bg-accent/20 rounded-md transition-colors">John Smith approved leave request</li>
					<li className="p-1 hover:bg-accent/20 rounded-md transition-colors">Policy updated: Remote Work</li>
				</ul>
			</CardContent>
		</Card>
	);
}

function UpcomingEvents() {
	return (
		<Card className="w-full md:w-1/2 mt-8 overflow-hidden">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm md:text-base font-medium">Upcoming Events</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="text-xs md:text-sm text-muted-foreground space-y-3">
					<li className="p-1 hover:bg-accent/20 rounded-md transition-colors">Interview: Sarah Lee (Tomorrow)</li>
					<li className="p-1 hover:bg-accent/20 rounded-md transition-colors">Company Holiday: June 12</li>
					<li className="p-1 hover:bg-accent/20 rounded-md transition-colors">Birthday: Michael Brown (Friday)</li>
				</ul>
			</CardContent>
		</Card>
	);
}

// Dummy data for the headcount trend chart
const headcountData = [
	{ month: 'Jan', employees: 95 },
	{ month: 'Feb', employees: 102 },
	{ month: 'Mar', employees: 108 },
	{ month: 'Apr', employees: 115 },
	{ month: 'May', employees: 118 },
	{ month: 'Jun', employees: 120 },
];

function HeadcountTrendChart() {
	return (
		<Card className="w-full mt-8 overflow-hidden">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm md:text-base font-medium">Headcount Trend</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-48 sm:h-56 md:h-64 w-full">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={headcountData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
							<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
							<XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
							<YAxis className="text-xs" tick={{ fontSize: 12 }} width={30} />
							<Tooltip
								contentStyle={{
									backgroundColor: 'hsl(var(--card))',
									border: '1px solid hsl(var(--border))',
									borderRadius: '6px'
								}}
							/>
							<Line
								type="monotone"
								dataKey="employees"
								stroke="hsl(271 91% 65%)"
								strokeWidth={2}
								dot={{ fill: 'hsl(271 91% 65%)', strokeWidth: 2, r: 3 }}
								activeDot={{ r: 5 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}

export default function Dashboard() {
	return (
		<div className="p-3 md:p-6 text-foreground max-w-full overflow-x-hidden">
			<div className="max-w-7xl mx-auto">
				<h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">HR Dashboard</h1>

				<StatCardGroup />
				<ExtraStatCardGroup />
				<QuickActions />
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
					<RecentActivity />
					<UpcomingEvents />
				</div>
				<HeadcountTrendChart />
			</div>
		</div>
	);
}
