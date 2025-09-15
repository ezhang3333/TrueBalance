import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface SpendingData {
  month: string;
  amount: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface SpendingChartProps {
  monthlyData: SpendingData[];
  categoryData: CategoryData[];
  totalSpending: number;
  previousMonthChange: number;
}

export function SpendingChart({ 
  monthlyData, 
  categoryData, 
  totalSpending, 
  previousMonthChange 
}: SpendingChartProps) {
  const isPositiveChange = previousMonthChange >= 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card data-testid="card-monthly-spending">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Spending</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-bold" data-testid="text-total-spending">
              ${totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <Badge 
              variant={isPositiveChange ? "destructive" : "secondary"}
              data-testid="badge-spending-change"
            >
              {isPositiveChange ? "+" : ""}{previousMonthChange.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Spending"]}
              />
              <Bar 
                dataKey="amount" 
                fill="hsl(var(--chart-1))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card data-testid="card-category-breakdown">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-2">
              {categoryData.map((category, index) => (
                <div 
                  key={category.name} 
                  className="flex items-center justify-between"
                  data-testid={`item-category-${category.name.toLowerCase()}`}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm font-mono">
                    ${category.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}