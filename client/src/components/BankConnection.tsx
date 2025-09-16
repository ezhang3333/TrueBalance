import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Building2, RefreshCw, CheckCircle, AlertCircle, Plus } from 'lucide-react';

interface TellerConfig {
  applicationId: string;
  environment: string;
  connectUrl: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
  isActive: boolean;
  lastSyncAt: Date;
}

declare global {
  interface Window {
    TellerConnect: {
      setup: (config: {
        applicationId: string;
        environment: string;
        onSuccess: (enrollment: { accessToken: string }) => void;
        onExit?: () => void;
      }) => void;
      open: () => void;
    };
  }
}

export function BankConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load Teller Connect script with error handling
  useEffect(() => {
    if (window.TellerConnect) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.teller.io/connect/connect.js';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
      setScriptError(false);
    };
    script.onerror = () => {
      setScriptError(true);
      setScriptLoaded(false);
      toast({
        title: 'Connection Error',
        description: 'Unable to load Teller Connect. This may be due to browser security settings blocking external scripts.',
        variant: 'destructive',
      });
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [toast]);

  // Get Teller configuration
  const { data: tellerConfig } = useQuery<TellerConfig>({
    queryKey: ['/api/teller/config'],
    enabled: !!localStorage.getItem('token'),
  });

  // Get user's accounts
  const { data: accounts, isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
    enabled: !!localStorage.getItem('token'),
  });

  // Connect bank account mutation
  const connectBankMutation = useMutation({
    mutationFn: async (accessToken: string) => {
      return apiRequest('POST', '/api/teller/connect', { accessToken });
    },
    onSuccess: () => {
      setIsConnected(true);
      toast({
        title: 'Bank Connected Successfully',
        description: 'Your bank accounts have been linked and transaction data is being synced.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect bank account. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Sync account data mutation
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

  const handleTellerConnect = () => {
    if (!scriptLoaded || !tellerConfig) {
      toast({
        title: 'Not Ready',
        description: 'Teller Connect is still loading. Please wait a moment.',
        variant: 'destructive',
      });
      return;
    }

    window.TellerConnect.setup({
      applicationId: tellerConfig.applicationId,
      environment: tellerConfig.environment,
      onSuccess: (enrollment: { accessToken: string }) => {
        // Connect bank account - token will be stored securely server-side
        connectBankMutation.mutate(enrollment.accessToken);
      },
      onExit: () => {
        console.log('User exited Teller Connect');
      },
    });

    window.TellerConnect.open();
  };

  const handleSync = () => {
    syncAccountsMutation.mutate();
  };

  const connectedAccountsCount = accounts?.filter(acc => acc.isActive)?.length || 0;
  const hasConnectedAccounts = connectedAccountsCount > 0;

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Bank Connections
              </CardTitle>
              <CardDescription>
                {hasConnectedAccounts
                  ? `${connectedAccountsCount} account${connectedAccountsCount > 1 ? 's' : ''} connected`
                  : 'Connect your bank accounts to start tracking your finances'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasConnectedAccounts && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncAccountsMutation.isPending || !hasConnectedAccounts}
                  data-testid="button-sync-accounts"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncAccountsMutation.isPending ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
              )}
              <Button
                onClick={handleTellerConnect}
                disabled={!scriptLoaded || !tellerConfig || connectBankMutation.isPending}
                data-testid="button-connect-bank"
              >
                <Plus className="h-4 w-4 mr-2" />
                {hasConnectedAccounts ? 'Add Account' : 'Connect Bank'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {hasConnectedAccounts && (
          <CardContent>
            <div className="space-y-3">
              {accountsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading accounts...
                </div>
              ) : (
                accounts?.map((account) => (
                  <div 
                    key={account.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                    data-testid={`account-item-${account.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {account.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <div>
                          <div className="font-medium" data-testid={`text-account-name-${account.id}`}>
                            {account.name}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {account.type}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold" data-testid={`text-account-balance-${account.id}`}>
                          ${parseFloat(account.balance || '0').toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {account.currency}
                        </div>
                      </div>
                      <Badge variant={account.isActive ? 'default' : 'secondary'}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {hasConnectedAccounts && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Last synced</span>
                  <span>
                    {accounts?.[0]?.lastSyncAt 
                      ? new Date(accounts[0].lastSyncAt).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Information Card */}
      {!hasConnectedAccounts && (
        <Card>
          <CardHeader>
            <CardTitle>Secure Bank Integration</CardTitle>
            <CardDescription>
              TrueBalance uses Teller's secure banking API to connect to 7,000+ financial institutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Bank-grade security with 256-bit encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Read-only access to account and transaction data</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Automatic transaction categorization and syncing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Support for major US banks and credit unions</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}