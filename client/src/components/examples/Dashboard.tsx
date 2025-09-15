import { Dashboard } from '../Dashboard';
import { useToast } from "@/hooks/use-toast";

export default function DashboardExample() {
  const { toast } = useToast();

  const handleLogout = () => {
    console.log('Logout triggered');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return <Dashboard onLogout={handleLogout} />;
}