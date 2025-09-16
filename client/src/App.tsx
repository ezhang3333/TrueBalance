import { useState, useEffect } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LoginForm } from "@/components/LoginForm";
import { Dashboard } from "@/components/Dashboard";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Building2, LogOut, User, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import Accounts from "@/pages/Accounts";

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
            <AuthenticatedApp onLogout={handleLogout} />
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

function AuthenticatedApp({ onLogout }: { onLogout: () => void }) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const navigationItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: location === "/",
    },
    {
      href: "/accounts",
      label: "Accounts",
      icon: Building2,
      isActive: location === "/accounts",
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-card border-r flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TB</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">TrueBalance</h1>
              <p className="text-xs text-muted-foreground">Financial Tracker</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href} data-testid={`link-nav-${item.label.toLowerCase()}`}>
                <Button
                  variant={item.isActive ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Section */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">User</p>
              <Badge variant="secondary" className="text-xs">Free Plan</Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="flex-1"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Switch>
          <Route path="/" component={() => <Dashboard />} />
          <Route path="/accounts" component={Accounts} />
          <Route component={() => <div className="p-6">Page not found</div>} />
        </Switch>
      </div>
    </div>
  );
}

export default App;
