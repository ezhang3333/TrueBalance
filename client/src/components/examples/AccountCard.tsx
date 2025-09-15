import { AccountCard } from '../AccountCard';

export default function AccountCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AccountCard
        accountName="Main Checking"
        accountType="checking"
        balance={4250.75}
        change={320.50}
        changePercent={8.2}
        isConnected={true}
      />
      <AccountCard
        accountName="High Yield Savings"
        accountType="savings"
        balance={15680.25}
        change={145.30}
        changePercent={0.9}
        isConnected={true}
      />
      <AccountCard
        accountName="Travel Credit Card"
        accountType="credit"
        balance={-1205.85}
        change={-85.20}
        changePercent={-7.6}
        isConnected={false}
      />
    </div>
  );
}