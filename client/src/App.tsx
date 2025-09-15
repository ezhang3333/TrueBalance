import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LoginForm } from "@/components/LoginForm";
import { Dashboard } from "@/components/Dashboard";
import { useToast } from "@/hooks/use-toast";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('Login attempt:', email);
    
    // todo: remove mock functionality - implement real authentication
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
      toast({
        title: "Welcome back!",
        description: "Successfully logged into TrueBalance.",
      });
    }, 1000);
  };

  const handleRegister = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('Registration attempt:', email);
    
    // todo: remove mock functionality - implement real registration
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
      toast({
        title: "Account created!",
        description: "Welcome to TrueBalance. Let's get started!",
      });
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    console.log('User logged out');
    toast({
      title: "Logged out",
      description: "Come back soon!",
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="truebalance-theme">
        <TooltipProvider>
          {isAuthenticated ? (
            <Dashboard onLogout={handleLogout} />
          ) : (
            <LoginForm
              onLogin={handleLogin}
              onRegister={handleRegister}
              isLoading={isLoading}
            />
          )}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
