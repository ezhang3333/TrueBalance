import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string) => void;
  isLoading?: boolean;
}

export function LoginForm({ onLogin, onRegister, isLoading = false }: LoginFormProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (isLoginMode) {
      onLogin(email, password);
      console.log('Login attempted with:', email);
    } else {
      onRegister(email, password);
      console.log('Registration attempted with:', email);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md" data-testid="card-login">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <DollarSign className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to TrueBalance
          </CardTitle>
          <CardDescription>
            {isLoginMode 
              ? "Sign in to your account to continue" 
              : "Create an account to start tracking your finances"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? "Please wait..." : (isLoginMode ? "Sign In" : "Create Account")}
            </Button>
          </form>

          <div className="mt-6">
            <Separator className="mb-4" />
            <div className="text-center text-sm">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <Button
                variant="ghost"
                className="p-0 h-auto font-normal"
                onClick={() => setIsLoginMode(!isLoginMode)}
                disabled={isLoading}
                data-testid="button-switch-mode"
              >
                {isLoginMode ? "Create one here" : "Sign in here"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}