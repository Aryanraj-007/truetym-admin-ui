'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  FlaskConical,
  Percent,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Hardcoded data for sections without API
const recentActivity = [
  {
    title: 'New subscription',
    description: 'Acme Corp',
    time: '2 minutes ago',
    dot: 'bg-teal-500',
  },
  {
    title: 'Payment received',
    description: 'Tech Innovations',
    time: '15 minutes ago',
    dot: 'bg-green-500',
  },
  { title: 'Trial started', description: 'StartupXYZ', time: '1 hour ago', dot: 'bg-blue-500' },
  {
    title: 'Subscription cancelled',
    description: 'OldClient Inc',
    time: '3 hours ago',
    dot: 'bg-red-500',
  },
];

const topPlans = [
  { name: 'Enterprise', customers: 342, progress: 85, color: 'bg-teal-500' },
  { name: 'Professional', customers: 587, progress: 70, color: 'bg-teal-600' },
  { name: 'Basic', customers: 318, progress: 45, color: 'bg-teal-400' },
];

const quickStats = [
  { label: 'Avg. Contract Value', value: '₹58,120' },
  { label: 'Customer Lifetime Value', value: '₹2.4L' },
  { label: 'Cost Per Acquisition', value: '₹12,500' },
];

export default function Dashboard() {
  // State for API data
  const [kpiData, setKpiData] = useState<any>(null);
  const [userBarGraphData, setUserBarGraphData] = useState<any>(null);
  const [clientBarGraphData, setClientBarGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch API data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');

        // Get current date range (last 6 months)
        const endDate = Math.floor(Date.now() / 1000);
        const startDate = endDate - 6 * 30 * 24 * 60 * 60; // Approx 6 months

        // Fetch KPI data
        const kpiRes = await fetch('/api/dashboard/kpis', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (kpiRes.ok) {
          const kpiDataResponse = await kpiRes.json();
          setKpiData(kpiDataResponse.data);
        }

        // Fetch User bar graph data
        const userRes = await fetch(
          `/api/dashboard/users/second-bar-graphs?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserBarGraphData(userData.data);
        }

        // Fetch Client bar graph data
        const clientRes = await fetch(
          `/api/dashboard/clients/second-bar-graphs?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (clientRes.ok) {
          const clientData = await clientRes.json();
          setClientBarGraphData(clientData.data);
        }

        setError(null);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Build stat cards from API data or fallback values
  const statCards = [
    {
      title: 'Total Customers',
      value:
        kpiData?.paidCustomers?.totalCustomers && kpiData?.trialCustomers?.totalCustomers
          ? `${kpiData.paidCustomers.totalCustomers + kpiData.trialCustomers.totalCustomers}`
          : '1,247',
      change: '+12.5%',
      subtext: 'vs last month',
      trend: 'up' as const,
      icon: Users,
    },
    {
      title: 'Monthly Recurring Revenue',
      value: kpiData?.paidCustomers?.recurringRevenue
        ? `₹${(kpiData.paidCustomers.recurringRevenue / 100000).toFixed(2)}L`
        : '₹62.35L',
      change: '+18.2%',
      subtext: 'from paid customers',
      trend: 'up' as const,
      icon: DollarSign,
    },
    {
      title: 'New Customers',
      value: '87',
      change: '+14.5%',
      subtext: 'This month',
      trend: 'up' as const,
      icon: UserPlus,
    },
    {
      title: 'Revenue This Month',
      value: '₹75.40L',
      change: '+22.1%',
      subtext: 'All revenue sources',
      trend: 'up' as const,
      icon: TrendingUp,
    },
    {
      title: 'Active Trial Users',
      value: kpiData?.trialCustomers?.totalActiveUsers
        ? `${kpiData.trialCustomers.totalActiveUsers}`
        : '234',
      change: '+8.3%',
      subtext: 'Trial users',
      trend: 'up' as const,
      icon: FlaskConical,
    },
    {
      title: 'Churn Rate',
      value: '3.2%',
      change: '-0.8%',
      subtext: 'Healthy status',
      trend: 'down' as const,
      icon: Percent,
    },
    {
      title: 'Total Active Users',
      value:
        kpiData?.paidCustomers?.totalActiveUsers && kpiData?.trialCustomers?.totalActiveUsers
          ? `${kpiData.paidCustomers.totalActiveUsers + kpiData.trialCustomers.totalActiveUsers}`
          : '1,156',
      change: '+15.8%',
      subtext: 'Currently active',
      trend: 'up' as const,
      icon: UserCheck,
    },
  ];

  // Transform user bar graph data for area chart
  const customerGrowthData = userBarGraphData
    ? userBarGraphData.months.map((month: string, idx: number) => ({
        month,
        active: userBarGraphData.activeClients?.[idx] || 0,
        inactive: userBarGraphData.churnedClients?.[idx] || 0,
      }))
    : [
        { month: 'Jan', active: 700, inactive: 50 },
        { month: 'Feb', active: 800, inactive: 55 },
        { month: 'Mar', active: 900, inactive: 60 },
        { month: 'Apr', active: 1000, inactive: 62 },
        { month: 'May', active: 1100, inactive: 65 },
        { month: 'Jun', active: 1200, inactive: 70 },
      ];

  // Transform client bar graph data for bar chart
  const revenueData = clientBarGraphData
    ? clientBarGraphData.months.map((month: string, idx: number) => ({
        month,
        actual: clientBarGraphData.activeClients?.[idx] || 0,
        target: clientBarGraphData.newClients?.[idx] || 0,
      }))
    : [
        { month: 'Jan', actual: 50, target: 45 },
        { month: 'Feb', actual: 55, target: 52 },
        { month: 'Mar', actual: 60, target: 58 },
        { month: 'Apr', actual: 65, target: 62 },
        { month: 'May', actual: 72, target: 68 },
        { month: 'Jun', actual: 75, target: 70 },
      ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-gray-500">
          Welcome back! Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stat Cards - Mapped from /dashboard/kpis API */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';

          return (
            <Card key={idx} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {isPositive ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <CardTitle className="mt-2 text-xs font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                {stat.subtext && <p className="mt-1 text-xs text-gray-500">{stat.subtext}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Customer Growth - Mapped from /dashboard/users/second-bar-graphs API */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
            <p className="text-sm text-gray-500">Monthly active vs inactive customers</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="active"
                  stackId="1"
                  stroke="#14b8a6"
                  fill="#5eead4"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="inactive"
                  stackId="1"
                  stroke="#94a3b8"
                  fill="#cbd5e1"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Performance - Mapped from /dashboard/clients/second-bar-graphs API */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Performance</CardTitle>
            <p className="text-sm text-gray-500">Monthly active clients vs new clients</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="actual" fill="#14b8a6" radius={[8, 8, 0, 0]} name="Active Clients" />
                <Bar dataKey="target" fill="#99f6e4" radius={[8, 8, 0, 0]} name="New Clients" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity - FULLY UNUSED (No API) */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`mt-2 h-2 w-2 rounded-full ${activity.dot}`}></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="mt-1 text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Plans - FULLY UNUSED (No API) */}
        <Card>
          <CardHeader>
            <CardTitle>Top Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPlans.map((plan, idx) => (
                <div key={idx}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                    <span className="text-sm text-gray-600">{plan.customers} customers</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className={`${plan.color} h-2 rounded-full transition-all`}
                      style={{ width: `${plan.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats - FULLY UNUSED (No API) */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quickStats.map((stat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0"
                >
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <span className="text-lg font-semibold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
