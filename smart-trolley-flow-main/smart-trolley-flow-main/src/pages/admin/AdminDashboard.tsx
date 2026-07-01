import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getDashboardStats, getAlerts, getSalesData, getTrolleys } from "@/api";
import {
  IndianRupee,
  ShoppingCart,
  AlertTriangle,
  Scale,
  TrendingUp,
  Clock,
  Activity,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const { data: dashboardStats = { totalSalesToday: 0, activeTrolleys: 0, unpaidExitAttempts: 0, weightMismatchAlerts: 0 } } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
    refetchInterval: 5000,
  });
  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: getAlerts,
    refetchInterval: 5000,
  });
  const { data: salesData = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: getSalesData,
    refetchInterval: 5000,
  });
  const { data: trolleys = [] } = useQuery({
    queryKey: ["trolleys"],
    queryFn: getTrolleys,
    refetchInterval: 5000,
  });

  const recentAlerts = alerts.filter(a => !a.resolved).slice(0, 3);
  const activeTrolleysList = trolleys.filter(t => t.status === 'active');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales Today"
          value={`₹${dashboardStats.totalSalesToday.toLocaleString()}`}
          icon={IndianRupee}
          variant="primary"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Active Trolleys"
          value={dashboardStats.activeTrolleys}
          subtitle="Currently in store"
          icon={ShoppingCart}
          variant="primary"
        />
        <StatCard
          title="Unpaid Exit Attempts"
          value={dashboardStats.unpaidExitAttempts}
          subtitle="Blocked by security"
          icon={AlertTriangle}
          variant="danger"
        />
        <StatCard
          title="Weight Mismatch Alerts"
          value={dashboardStats.weightMismatchAlerts}
          subtitle="Pending resolution"
          icon={Scale}
          variant="warning"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl shadow-card border border-border/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Sales Overview</h2>
              <p className="text-sm text-muted-foreground">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-2 text-success">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">+15.3%</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                  stroke="hsl(215, 16%, 47%)"
                  fontSize={12}
                />
                <YAxis
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  stroke="hsl(215, 16%, 47%)"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(214, 32%, 91%)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                />
                <Area
                  type="monotone"
                  dataKey="totalSales"
                  stroke="hsl(142, 71%, 45%)"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Alerts</h2>
            <StatusBadge variant="error" pulse>
              {recentAlerts.length} Active
            </StatusBadge>
          </div>
          <div className="divide-y divide-border">
            {recentAlerts.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No recent alerts. System is all clear.
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${alert.severity === 'high'
                      ? 'bg-destructive/10 text-destructive'
                      : alert.severity === 'medium'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-info/10 text-info'
                      }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {alert.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Trolleys */}
      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Active Trolleys</h2>
            <p className="text-sm text-muted-foreground">Real-time trolley monitoring</p>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Activity className="h-5 w-5" />
            <span className="text-sm font-medium">{activeTrolleysList.length} Online</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Trolley ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Items</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeTrolleysList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                    No active trolleys at the moment.
                  </td>
                </tr>
              ) : (
                activeTrolleysList.map((trolley) => (
                  <tr key={trolley.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <span className="font-medium text-foreground">{trolley.id}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-foreground">
                        {trolley.customerId ? trolley.customerName : '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-foreground">{trolley.items.filter(i => i.status === 'added').length}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-foreground">₹{trolley.totalAmount.toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      <StatusBadge
                        variant={
                          trolley.status === 'active' ? 'success' :
                            trolley.status === 'payment_pending' ? 'warning' : 'neutral'
                        }
                        pulse={trolley.status === 'active'}
                      >
                        {trolley.status.replace('_', ' ')}
                      </StatusBadge>
                    </td>
                    <td className="p-4">
                      <StatusBadge variant={trolley.weightVerified ? 'success' : 'error'}>
                        {trolley.weightVerified ? 'Verified' : 'Mismatch'}
                      </StatusBadge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
