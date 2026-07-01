import { useQuery } from "@tanstack/react-query";
import { getSalesData } from "@/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  Calendar,
  Download,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";

export default function SalesReports() {
  const { data: salesData = [], isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: getSalesData,
    refetchInterval: 5000, // Fetch every 5 seconds for real-time updates
  });
  const totalSales = salesData.reduce((sum, d) => sum + d.totalSales, 0);
  const totalTransactions = salesData.reduce((sum, d) => sum + d.transactionCount, 0);
  const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in flex items-center justify-center min-h-[200px]">
        <span className="text-muted-foreground">Loading sales data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Sales Reports</h1>
          <p className="text-muted-foreground mt-1">Analyze your store performance</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue (7 days)"
          value={`₹${totalSales.toLocaleString()}`}
          icon={IndianRupee}
          variant="primary"
        />
        <StatCard
          title="Total Transactions"
          value={totalTransactions.toLocaleString()}
          icon={ShoppingBag}
          variant="primary"
        />
        <StatCard
          title="Average Transaction"
          value={`₹${avgTransaction.toFixed(2)}`}
          icon={TrendingUp}
          variant="primary"
        />
        <StatCard
          title="Report Period"
          value="7 Days"
          subtitle="Jan 9 - Jan 15, 2024"
          icon={Calendar}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Sales Bar Chart */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Daily Sales</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
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
                <Bar
                  dataKey="totalSales"
                  fill="hsl(142, 71%, 45%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions Line Chart */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Transaction Count</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                  stroke="hsl(215, 16%, 47%)"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(215, 16%, 47%)"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(214, 32%, 91%)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [value, 'Transactions']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                />
                <Line
                  type="monotone"
                  dataKey="transactionCount"
                  stroke="hsl(217, 91%, 60%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(217, 91%, 60%)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Daily Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total Sales</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Transactions</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Avg. Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {salesData.map((data) => (
                <tr key={data.date} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <span className="font-medium text-foreground">
                      {new Date(data.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-foreground">₹{data.totalSales.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-foreground">{data.transactionCount}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-foreground">
                      ₹{(data.totalSales / data.transactionCount).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
