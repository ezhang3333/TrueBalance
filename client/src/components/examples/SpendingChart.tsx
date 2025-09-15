import { SpendingChart } from '../SpendingChart';

export default function SpendingChartExample() {
  // todo: remove mock functionality
  const monthlyData = [
    { month: "Jan", amount: 2450 },
    { month: "Feb", amount: 3100 },
    { month: "Mar", amount: 2800 },
    { month: "Apr", amount: 3300 },
    { month: "May", amount: 2950 },
    { month: "Jun", amount: 3600 },
  ];

  // todo: remove mock functionality
  const categoryData = [
    { name: "Food & Dining", value: 1250, color: "hsl(var(--chart-2))" },
    { name: "Transportation", value: 850, color: "hsl(var(--chart-3))" },
    { name: "Shopping", value: 950, color: "hsl(var(--chart-1))" },
    { name: "Housing", value: 420, color: "hsl(var(--chart-4))" },
    { name: "Entertainment", value: 330, color: "hsl(var(--chart-5))" },
  ];

  return (
    <SpendingChart
      monthlyData={monthlyData}
      categoryData={categoryData}
      totalSpending={3800}
      previousMonthChange={12.5}
    />
  );
}