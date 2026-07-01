import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Radio,
  Scan,
  ArrowRight,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getAvailableTrolleys, selectTrolley, getCurrentCustomerTrolley } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import type { AvailableTrolley } from "@/types";

export default function TrolleySelection() {
  const [manualUid, setManualUid] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, email } = useAuth();

  // Check if they already have an active trolley
  const { data: customerData, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ["customer", "me"],
    queryFn: getCurrentCustomerTrolley,
    retry: false, // Don't retry if it fails (likely means no trolley or 404)
  });

  useEffect(() => {
    // If they already have a trolley, go straight to the dashboard
    if (customerData?.trolley) {
      toast({
        title: "Session Resumed",
        description: "Your active trolley session was resumed.",
      });
      navigate("/customer/dashboard", { replace: true });
    }
  }, [customerData, navigate, toast]);

  const handleLogout = () => {
    logout();
    navigate("/customer/login");
  };

  const { data: trolleys = [], isLoading: isLoadingAvailable, refetch } = useQuery({
    queryKey: ["available-trolleys"],
    queryFn: async () => {
      const list = await getAvailableTrolleys();
      return list;
    },
    enabled: !customerData?.trolley, // Only fetch available if they don't have one
  });

  const isLoading = isLoadingCurrent || isLoadingAvailable;

  const handleSelectTrolley = async (uid: string) => {
    if (!uid?.trim()) {
      toast({
        title: "Invalid UID",
        description: "Please enter or select a trolley UID.",
        variant: "destructive",
      });
      return;
    }
    setIsSelecting(true);
    try {
      await selectTrolley(uid.trim());
      toast({
        title: "Trolley Selected",
        description: "You can now start shopping.",
      });
      navigate("/customer/dashboard", { replace: true });
    } catch (err) {
      toast({
        title: "Selection Failed",
        description: err instanceof Error ? err.message : "Could not select trolley.",
        variant: "destructive",
      });
    } finally {
      setIsSelecting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSelectTrolley(manualUid);
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-foreground">{email}</p>
          <p className="text-xs text-muted-foreground">Customer</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="gradient-primary p-2 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">SmartMart</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Select Your Trolley</h1>
            <p className="text-muted-foreground mt-2">
              Scan your trolley RFID or choose from available trolleys below
            </p>
          </div>

          {/* Manual UID entry (for RFID scanner emulation) */}
          <form onSubmit={handleManualSubmit} className="mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Scan className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Scan or enter trolley UID (e.g. D9 1F AB 4)"
                  value={manualUid}
                  onChange={(e) => setManualUid(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button
                type="submit"
                className="h-12"
                disabled={isSelecting || !manualUid.trim()}
              >
                {isSelecting ? "..." : "Select"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Point RFID scanner at trolley tag, or type UID manually
            </p>
          </form>

          {/* Available trolleys list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">
                Available trolleys
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading trolleys...
              </div>
            ) : trolleys.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                <Radio className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No trolleys available.</p>
                <p className="text-sm mt-1">Ask staff to add trolleys in Admin panel.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {trolleys.map((t: AvailableTrolley) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTrolley(t.uid)}
                    disabled={isSelecting}
                    className="w-full p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t.uid}</p>
                        <p className="text-xs text-muted-foreground">{t.id}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Each trolley has a unique RFID UID. The gate at exit opens only after payment.
          </p>
        </div>
      </div>
    </div>
  );
}
