import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  accountName: string;
  accountType: string;
  balance: number;
  change: number;
  changePercent: number;
  isConnected?: boolean;
}

export function AccountCard({
  accountName,
  accountType,
  balance,
  change,
  changePercent,
  isConnected = true,
}: AccountCardProps) {
  const isPositive = change >= 0;
  
  return (
    <Card className="hover-elevate" data-testid={`card-account-${accountName.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {accountName}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge 
            variant={accountType === "checking" ? "default" : accountType === "savings" ? "secondary" : "outline"}
            data-testid={`badge-account-type-${accountType}`}
          >
            {accountType}
          </Badge>
          {isConnected && (
            <div className="h-2 w-2 rounded-full bg-chart-2" data-testid="status-connected" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold font-mono" data-testid={`text-balance-${accountName.toLowerCase().replace(/\s+/g, '-')}`}>
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className={cn(
              "text-xs flex items-center gap-1 mt-1",
              isPositive ? "text-chart-2" : "text-chart-4"
            )}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span data-testid={`text-change-${accountName.toLowerCase().replace(/\s+/g, '-')}`}>
                ${Math.abs(change).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({changePercent.toFixed(1)}%)
              </span>
            </div>
          </div>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}