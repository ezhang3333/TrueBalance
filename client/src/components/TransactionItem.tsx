import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Car, 
  Home, 
  Coffee, 
  Plane, 
  Heart, 
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionItemProps {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  account: string;
  type: "income" | "expense";
}

const categoryIcons = {
  shopping: ShoppingBag,
  transportation: Car,
  housing: Home,
  food: Coffee,
  travel: Plane,
  healthcare: Heart,
  other: DollarSign,
};

const categoryColors = {
  shopping: "bg-chart-1/10 text-chart-1",
  transportation: "bg-chart-3/10 text-chart-3", 
  housing: "bg-chart-4/10 text-chart-4",
  food: "bg-chart-2/10 text-chart-2",
  travel: "bg-chart-5/10 text-chart-5",
  healthcare: "bg-destructive/10 text-destructive",
  other: "bg-muted text-muted-foreground",
};

export function TransactionItem({
  id,
  description,
  amount,
  category,
  date,
  account,
  type
}: TransactionItemProps) {
  const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || DollarSign;
  const colorClass = categoryColors[category as keyof typeof categoryColors] || categoryColors.other;
  const isExpense = type === "expense";
  
  return (
    <Card className="hover-elevate" data-testid={`card-transaction-${id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", colorClass)}>
              <IconComponent className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium" data-testid={`text-description-${id}`}>
                {description}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span data-testid={`text-date-${id}`}>{date}</span>
                <span>•</span>
                <span data-testid={`text-account-${id}`}>{account}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" data-testid={`badge-category-${id}`}>
              {category}
            </Badge>
            <div className={cn(
              "font-mono font-semibold flex items-center gap-1",
              isExpense ? "text-chart-4" : "text-chart-2"
            )}>
              {isExpense ? (
                <ArrowDownLeft className="h-3 w-3" />
              ) : (
                <ArrowUpRight className="h-3 w-3" />
              )}
              <span data-testid={`text-amount-${id}`}>
                {isExpense ? "-" : "+"}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}