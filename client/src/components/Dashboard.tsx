import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AccountCard } from "./AccountCard";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { 
  Plus,
  Download,
  RefreshCw,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from "lucide-react";

// Import shared types from schema for consistency
import type { Account, Transaction } from '@shared/schema';

export function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real accounts data
  const { data: accounts, isLoading: accountsLoading, error: accountsError } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
    enabled: !!localStorage.getItem('token'),
  });

  // Fetch real transactions data
  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    enabled: !!localStorage.getItem('token'),
  });

  // Handle API errors with useEffect to prevent repeated toasts
  useEffect(() => {
    if (accountsError) {
      toast({
        title: 'Failed to load accounts',
        description: 'Unable to fetch your bank account data. Please try refreshing.',
        variant: 'destructive',
      });
    }
  }, [accountsError, toast]);
  
  useEffect(() => {
    if (transactionsError) {
      toast({
        title: 'Failed to load transactions', 
        description: 'Unable to fetch your transaction history. Please try refreshing.',
        variant: 'destructive',
      });
    }
  }, [transactionsError, toast]);

  // Sync accounts mutation
  const syncAccountsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/teller/sync', {});
    },
    onSuccess: () => {
      toast({
        title: 'Sync Complete',
        description: 'Account data has been updated with the latest transactions.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync account data. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Calculate real financial metrics
  const totalBalance = accounts?.reduce((sum, account) => sum + parseFloat(account.balance || '0'), 0) || 0;
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthTransactions = transactions?.filter(tx => {
    // Defensive date parsing to handle both string and Date objects
    const txDate = new Date(typeof tx.date === 'string' ? tx.date : tx.date);
    return !isNaN(txDate.getTime()) && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  }) || [];
  
  const monthlyIncome = currentMonthTransactions
    .filter(tx => parseFloat(tx.amount) > 0)
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    
  const monthlyExpenses = Math.abs(currentMonthTransactions
    .filter(tx => parseFloat(tx.amount) < 0)
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0));
    
  const netSavings = monthlyIncome - monthlyExpenses;
  
  // Calculate category totals from real transactions
  const categoryTotals = currentMonthTransactions
    .filter(tx => parseFloat(tx.amount) < 0)
    .reduce((acc, tx) => {
      const category = tx.category || 'other';
      acc[category] = (acc[category] || 0) + parseFloat(tx.amount);
      return acc;
    }, {} as Record<string, number>);

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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => syncAccountsMutation.mutate()}
            disabled={syncAccountsMutation.isPending || !accounts?.length}
            data-testid="button-sync"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncAccountsMutation.isPending ? 'animate-spin' : ''}`} />
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
              <span className={netSavings >= 0 ? "text-green-600" : "text-red-600"}>
                {accounts?.length ? 'Based on connected accounts' : 'Connect accounts to see data'}
              </span>
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
              {currentMonthTransactions.filter(tx => parseFloat(tx.amount) > 0).length} transactions this month
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
              {currentMonthTransactions.filter(tx => parseFloat(tx.amount) < 0).length} transactions this month
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
              Current month savings rate
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
                {accountsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading accounts...
                  </div>
                ) : accounts && accounts.length > 0 ? (
                  accounts.map((account) => (
                    <AccountCard 
                      key={account.id}
                      accountName={account.name}
                      accountType={account.type}
                      balance={parseFloat(account.balance)}
                      change={0} // Historical data not available yet
                      changePercent={0}
                      isConnected={account.isActive}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                    <p>No bank accounts connected</p>
                    <p className="text-sm">Connect your first bank account to get started</p>
                  </div>
                )}
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
                {Object.keys(categoryTotals).length > 0 ? (
                  Object.entries(categoryTotals).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-primary"></div>
                        <span className="text-sm font-medium capitalize">{category}</span>
                      </div>
                      <span className="text-sm font-medium text-red-600">
                        ${Math.abs(amount).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No spending data this month</p>
                  </div>
                )}
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
              {transactionsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading transactions...
                </div>
              ) : transactions && transactions.length > 0 ? (
                transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground capitalize">{transaction.category || 'uncategorized'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${parseFloat(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(transaction.amount) >= 0 ? '+' : ''}${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No recent transactions</p>
                </div>
              )}
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
                <p className="text-2xl font-bold">${monthlyExpenses.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Spending This Month</p>
              </div>
              <div className="space-y-3">
                {Object.keys(categoryTotals).length > 0 ? (
                  Object.entries(categoryTotals).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-primary"></div>
                        <span className="text-sm font-medium capitalize">{category}</span>
                      </div>
                      <span className="text-sm font-medium text-red-600">
                        ${Math.abs(amount).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No spending data this month</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}