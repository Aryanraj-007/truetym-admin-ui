'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Users, 
  DollarSign, 
  UserPlus, 
  TrendingUp, 
  FlaskConical, 
  Percent,
  ArrowUp,
  ArrowDown,
  UserCheck
} from 'lucide-react';

// Data
const customerGrowthData = [
  { month: 'Jan', active: 700, inactive: 50 },
  { month: 'Feb', active: 800, inactive: 55 },
  { month: 'Mar', active: 900, inactive: 60 },
  { month: 'Apr', active: 1000, inactive: 62 },
  { month: 'May', active: 1100, inactive: 65 },
  { month: 'Jun', active: 1200, inactive: 70 },
];

const revenueData = [
  { month: 'Jan', actual: 50, target: 45 },
  { month: 'Feb', actual: 55, target: 52 },
  { month: 'Mar', actual: 60, target: 58 },
  { month: 'Apr', actual: 65, target: 62 },
  { month: 'May', actual: 72, target: 68 },
  { month: 'Jun', actual: 75, target: 70 },
];

const recentActivity = [
  { title: 'New subscription', description: 'Acme Corp', time: '2 minutes ago', dot: 'bg-teal-500' },
  { title: 'Payment received', description: 'Tech Innovations', time: '15 minutes ago', dot: 'bg-green-500' },
  { title: 'Trial started', description: 'StartupXYZ', time: '1 hour ago', dot: 'bg-blue-500' },
  { title: 'Subscription cancelled', description: 'OldClient Inc', time: '3 hours ago', dot: 'bg-red-500' },
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

export default function DashboardPage() {
  const statCards = [
    {
      title: 'Total Customers',
      value: '1,247',
      change: '+12.5%',
      subtext: 'vs 1,108 last month',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Monthly Recurring Revenue',
      value: '₹62.35L',
      change: '+18.2%',
      subtext: '₹52.75L last month',
      trend: 'up',
      icon: DollarSign,
    },
    {
      title: 'New Customers',
      value: '87',
      change: '+14.5%',
      subtext: 'This month',
      trend: 'up',
      icon: UserPlus,
    },
    {
      title: 'Revenue This Month',
      value: '₹75.40L',
      change: '+22.1%',
      subtext: 'All revenue sources',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: 'Active Trial Users',
      value: '234',
      change: '+8.3%',
      subtext: '32% conversion rate',
      trend: 'up',
      icon: FlaskConical,
    },
    {
      title: 'Churn Rate',
      value: '3.2%',
      change: '-0.8%',
      subtext: 'Healthy status',
      trend: 'down',
      icon: Percent,
    },
    {
      title: 'Total Active Users',
      value: '1,156',
      change: '+15.8%',
      subtext: 'Currently active',
      trend: 'up',
      icon: UserCheck,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';
          
          return (
            <Card key={idx} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5 text-gray-500" />
                  <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <CardTitle className="text-xs font-medium text-gray-600 mt-2">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                {stat.subtext && <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Growth */}
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
                <Area type="monotone" dataKey="active" stackId="1" stroke="#14b8a6" fill="#5eead4" fillOpacity={0.6} />
                <Area type="monotone" dataKey="inactive" stackId="1" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Performance</CardTitle>
            <p className="text-sm text-gray-500">Monthly revenue vs target</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="actual" fill="#14b8a6" radius={[8, 8, 0, 0]} name="Actual Revenue" />
                <Bar dataKey="target" fill="#99f6e4" radius={[8, 8, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${activity.dot}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Top Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPlans.map((plan, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                    <span className="text-sm text-gray-600">{plan.customers} customers</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
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

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quickStats.map((stat, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
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

