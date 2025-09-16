import { BankConnection } from '@/components/BankConnection';

export default function Accounts() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bank Accounts</h1>
        <p className="text-muted-foreground">
          Connect and manage your bank accounts to track your financial data
        </p>
      </div>
      
      <BankConnection />
    </div>
  );
}