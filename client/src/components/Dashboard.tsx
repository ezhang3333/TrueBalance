import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  SidebarProvider, 
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AccountCard } from "./AccountCard";
import { TransactionItem } from "./TransactionItem";
import { SpendingChart } from "./SpendingChart";
import { SearchAndFilter } from "./SearchAndFilter";
import { ThemeToggle } from "./ThemeToggle";
import { 
  Home, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Plus,
  Download,
  RefreshCw,
  TrendingUp,
  DollarSign
} from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeView, setActiveView] = useState("dashboard");

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
      amount: -85.32,
      category: "food",
      date: "Today",
      account: "Main Checking",
      type: "expense" as const
    },
    {
      id: "txn-2", 
      description: "Payroll Deposit",
      amount: 3250.00,
      category: "other",
      date: "Yesterday",
      account: "Main Checking", 
      type: "income" as const
    },
    {
      id: "txn-3",
      description: "Gas Station",
      amount: -42.15,
      category: "transportation",
      date: "2 days ago",
      account: "Main Checking",
      type: "expense" as const
    },
    {
      id: "txn-4",
      description: "Amazon Purchase", 
      amount: -156.78,
      category: "shopping",
      date: "3 days ago",
      account: "Travel Credit Card",
      type: "expense" as const
    }
  ];

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

  const sidebarItems = [
    { title: "Dashboard", icon: Home, key: "dashboard" },
    { title: "Accounts", icon: CreditCard, key: "accounts" },
    { title: "Analytics", icon: BarChart3, key: "analytics" },
    { title: "Settings", icon: Settings, key: "settings" },
  ];

  const handleFilterChange = (filters: any) => {
    console.log('Dashboard filters changed:', filters);
  };

  const totalBalance = mockAccounts.reduce((sum, account) => sum + account.balance, 0);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-lg font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                TrueBalance
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton 
                        asChild
                        className={activeView === item.key ? "bg-sidebar-accent" : ""}
                        data-testid={`button-nav-${item.key}`}
                      >
                        <button onClick={() => setActiveView(item.key)}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={onLogout} data-testid="button-logout">
                      <Settings className="h-4 w-4" />
                      <span>Sign Out</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h1 className="text-xl font-semibold">
                  {sidebarItems.find(item => item.key === activeView)?.title || "Dashboard"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back! Here's your financial overview.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" data-testid="button-sync">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Accounts
              </Button>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeView === "dashboard" && (
              <div className="space-y-6">
                {/* Total Balance Overview */}
                <Card data-testid="card-total-balance">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Total Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold font-mono">
                      ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Across {mockAccounts.length} connected accounts
                    </p>
                  </CardContent>
                </Card>

                {/* Account Cards */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Accounts</h2>
                    <Button size="sm" data-testid="button-add-account">
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Account
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mockAccounts.map((account, index) => (
                      <AccountCard key={index} {...account} />
                    ))}
                  </div>
                </div>

                {/* Spending Analytics */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Spending Analytics</h2>
                  <SpendingChart
                    monthlyData={monthlyData}
                    categoryData={categoryData} 
                    totalSpending={3800}
                    previousMonthChange={12.5}
                  />
                </div>

                {/* Recent Transactions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Recent Transactions</h2>
                    <Button variant="outline" size="sm" data-testid="button-export">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  
                  <SearchAndFilter
                    onFilterChange={handleFilterChange}
                    categories={["food", "transportation", "shopping", "housing", "entertainment"]}
                    accounts={mockAccounts.map(account => account.accountName)}
                  />
                  
                  <div className="mt-4 space-y-3">
                    {mockTransactions.map((transaction) => (
                      <TransactionItem key={transaction.id} {...transaction} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeView === "accounts" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Account Management</h2>
                  <Button data-testid="button-add-account-page">
                    <Plus className="h-4 w-4 mr-2" />
                    Connect New Account
                  </Button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockAccounts.map((account, index) => (
                    <AccountCard key={index} {...account} />
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockAccounts.map((account, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">{account.accountName}</div>
                            <div className="text-sm text-muted-foreground">{account.accountType}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={account.isConnected ? "default" : "destructive"}>
                              {account.isConnected ? "Connected" : "Disconnected"}
                            </Badge>
                            <Button variant="outline" size="sm">
                              {account.isConnected ? "Refresh" : "Reconnect"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === "analytics" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Financial Analytics</h2>
                
                <SpendingChart
                  monthlyData={monthlyData}
                  categoryData={categoryData}
                  totalSpending={3800}
                  previousMonthChange={12.5}
                />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Average Monthly Spending</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-mono">$3,050</div>
                      <p className="text-xs text-muted-foreground">Based on last 6 months</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Top Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Food & Dining</div>
                      <p className="text-xs text-muted-foreground">32.9% of total spending</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Savings Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-chart-2">24.8%</div>
                      <p className="text-xs text-muted-foreground">Above average!</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeView === "settings" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Settings</h2>
                
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Display Currency</label>
                        <Input value="USD ($)" readOnly className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Date Format</label>
                        <Input value="MM/DD/YYYY" readOnly className="mt-1" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Security</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full">
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full">
                        Download Data
                      </Button>
                      <Separator />
                      <Button variant="destructive" className="w-full" onClick={onLogout}>
                        Sign Out
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}