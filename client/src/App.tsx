import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LoginForm } from "@/components/LoginForm";
import { Dashboard } from "@/components/Dashboard";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated on app load
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.login(email, password);
      setIsAuthenticated(true);
      toast({
        title: "Welcome back!",
        description: "Successfully logged into TrueBalance.",
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.register(email, password);
      setIsAuthenticated(true);
      toast({
        title: "Account created!",
        description: "Welcome to TrueBalance. Let's get started!",
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      toast({
        title: "Logged out",
        description: "Come back soon!",
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still log out locally even if server request fails
      setIsAuthenticated(false);
    }
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
