import { TransactionItem } from '../TransactionItem';

export default function TransactionItemExample() {
  return (
    <div className="space-y-3">
      <TransactionItem
        id="txn-1"
        description="Whole Foods Market"
        amount={-85.32}
        category="food"
        date="Today"
        account="Main Checking"
        type="expense"
      />
      <TransactionItem
        id="txn-2"
        description="Payroll Deposit"
        amount={3250.00}
        category="other"
        date="Yesterday"
        account="Main Checking"
        type="income"
      />
      <TransactionItem
        id="txn-3"
        description="Gas Station"
        amount={-42.15}
        category="transportation"
        date="2 days ago"
        account="Main Checking"
        type="expense"
      />
      <TransactionItem
        id="txn-4"
        description="Amazon Purchase"
        amount={-156.78}
        category="shopping"
        date="3 days ago"
        account="Travel Credit Card"
        type="expense"
      />
    </div>
  );
}