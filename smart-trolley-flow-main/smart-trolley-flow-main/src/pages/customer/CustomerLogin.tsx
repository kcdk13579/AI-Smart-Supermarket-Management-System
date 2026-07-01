import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, logout, isAuthenticated, isAdmin, isCustomerRole } = useAuth();

  useEffect(() => {
    if (isAuthenticated && isAdmin) navigate("/admin/dashboard", { replace: true });
    else if (isAuthenticated && isCustomerRole) navigate("/customer/select-trolley", { replace: true });
  }, [isAuthenticated, isAdmin, isCustomerRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await login(email, password);
      if (data.role === "ROLE_ADMIN") {
        logout();
        setError("Use Admin Login for administrator access.");
        return;
      }
      toast({
        title: "Welcome back!",
        description: "Please select a trolley to start shopping.",
      });
      navigate("/customer/select-trolley");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm mb-8">
            <ShoppingCart className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">
            Smart Shopping Experience
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Scan, shop, and pay with our IoT-enabled smart trolley system. 
            No queues, no hassle – just seamless shopping.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="p-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl">
              <p className="text-3xl font-bold text-primary-foreground">500+</p>
              <p className="text-sm text-primary-foreground/70">Products</p>
            </div>
            <div className="p-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl">
              <p className="text-3xl font-bold text-primary-foreground">24/7</p>
              <p className="text-sm text-primary-foreground/70">Service</p>
            </div>
            <div className="p-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl">
              <p className="text-3xl font-bold text-primary-foreground">0</p>
              <p className="text-sm text-primary-foreground/70">Wait Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="gradient-primary p-2 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">SmartMart</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in to access your smart trolley
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/customer/register" className="text-primary font-medium hover:underline">
                Register
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Are you an administrator?{" "}
              <Link to="/admin/login" className="text-primary font-medium hover:underline">
                Admin Login
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              Sign in with your account. Ensure the auth-service is running (e.g. port 8081).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
