import { LoginForm } from '../LoginForm';
import { useToast } from "@/hooks/use-toast";

export default function LoginFormExample() {
  const { toast } = useToast();

  const handleLogin = (email: string, password: string) => {
    console.log('Login:', email, password);
    toast({
      title: "Login Attempted",
      description: `Attempting to log in with ${email}`,
    });
  };

  const handleRegister = (email: string, password: string) => {
    console.log('Register:', email, password);
    toast({
      title: "Registration Attempted", 
      description: `Attempting to register with ${email}`,
    });
  };

  return (
    <LoginForm
      onLogin={handleLogin}
      onRegister={handleRegister}
      isLoading={false}
    />
  );
}