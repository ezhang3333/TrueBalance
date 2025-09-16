import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountCard } from "./AccountCard";
import { 
  Plus,
  Download,
  RefreshCw,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export function Dashboard() {
  // todo: remove mock functionality
  const mockAccounts = [
    {
      accountName: "Main Checking",
      accountType: "checking",
      balance: 4250.75,
      change: 320.50,
      changePercent: 8.2,
      isConnected: true
    },
    {
      accountName: "High Yield Savings", 
      accountType: "savings",
      balance: 15680.25,
      change: 145.30,
      changePercent: 0.9,
      isConnected: true
    },
    {
      accountName: "Travel Credit Card",
      accountType: "credit", 
      balance: -1205.85,
      change: -85.20,
      changePercent: -7.6,
      isConnected: false
    }
  ];

  // todo: remove mock functionality
  const mockTransactions = [
    {
      id: "txn-1",
      description: "Whole Foods Market",
      amount: -67.42,
      category: "food",
      date: "2024-01-15",
      account: "Main Checking"
    },
    {
      id: "txn-2",
      description: "Salary Deposit",
      amount: 3200.00,
      category: "income",
      date: "2024-01-15",
      account: "Main Checking"
    },
    {
      id: "txn-3",
      description: "Netflix Subscription",
      amount: -15.99,
      category: "entertainment",
      date: "2024-01-14",
      account: "Main Checking"
    },
    {
      id: "txn-4",
      description: "Gas Station",
      amount: -45.30,
      category: "transportation",
      date: "2024-01-14",
      account: "Main Checking"
    },
    {
      id: "txn-5",
      description: "Transfer to Savings",
      amount: -500.00,
      category: "transfer",
      date: "2024-01-13",
      account: "Main Checking"
    }
  ];

  // todo: remove mock functionality
  const mockCategoryTotals = {
    food: -245.67,
    transportation: -156.89,
    entertainment: -89.45,
    shopping: -234.12,
    housing: -1200.00,
    other: -89.56
  };

  const totalBalance = mockAccounts.reduce((sum, account) => sum + account.balance, 0);
  const monthlyChange = mockAccounts.reduce((sum, account) => sum + account.change, 0);
  const monthlyIncome = mockTransactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const monthlyExpenses = Math.abs(mockTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + tx.amount, 0));

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Track your finances and spending patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-sync">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Accounts
          </Button>
          <Button variant="outline" size="sm" data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" data-testid="button-add-account">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-balance">
              ${totalBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className={monthlyChange >= 0 ? "text-green-600" : "text-red-600"}>
                {monthlyChange >= 0 ? "+" : ""}${monthlyChange.toFixed(2)}
              </span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-monthly-income">
              +${monthlyIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-monthly-expenses">
              -${monthlyExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              -8.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-net-savings">
              ${(monthlyIncome - monthlyExpenses).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +24.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {mockAccounts.map((account, index) => (
                  <AccountCard 
                    key={index}
                    accountName={account.accountName}
                    accountType={account.accountType}
                    balance={account.balance}
                    change={account.change}
                    changePercent={account.changePercent}
                    isConnected={account.isConnected}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(mockCategoryTotals).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-primary"></div>
                      <span className="text-sm font-medium capitalize">{category}</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      ${Math.abs(amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions and Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground capitalize">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold">$2,015.69</p>
                <p className="text-sm text-muted-foreground">Total Spending This Month</p>
              </div>
              <div className="space-y-3">
                {Object.entries(mockCategoryTotals).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-primary"></div>
                      <span className="text-sm font-medium capitalize">{category}</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      ${Math.abs(amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}