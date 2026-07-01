import { ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface CustomerHeaderProps {
  customerName: string;
  trolleyId: string;
}

export function CustomerHeader({ customerName, trolleyId }: CustomerHeaderProps) {
  const navigate = useNavigate();
  const { logout, email } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/customer/login");
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Store Name */}
          <div className="flex items-center gap-3">
            <div className="gradient-primary p-2 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">SmartMart</h1>
              <p className="text-xs text-muted-foreground">IoT Supermarket</p>
            </div>
          </div>

          {/* User Info & Trolley */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">Trolley {trolleyId}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{email || customerName}</p>
                <p className="text-xs text-muted-foreground">Customer</p>
              </div>
              <div className="h-9 w-9 bg-muted rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
