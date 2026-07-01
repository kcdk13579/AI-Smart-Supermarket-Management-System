import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrolleys, createTrolley } from "@/api";
import { StatusBadge } from "@/components/ui/status-badge";
import { Trolley } from "@/types";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  User,
  Clock,
  Activity,
  Plus,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ActiveTrolleys() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newUid, setNewUid] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { data: trolleys = [], isLoading } = useQuery({
    queryKey: ["trolleys"],
    queryFn: getTrolleys,
  });

  const handleAddTrolley = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = newUid.trim();
    if (!uid) {
      toast({ title: "UID required", description: "Enter trolley RFID UID", variant: "destructive" });
      return;
    }
    setIsAdding(true);
    try {
      await createTrolley(uid);
      queryClient.invalidateQueries({ queryKey: ["trolleys"] });
      setNewUid("");
      toast({ title: "Trolley added", description: `Trolley ${uid} registered successfully` });
    } catch (err) {
      toast({
        title: "Failed to add trolley",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleWebSocketMessage = useCallback((updatedTrolley: Trolley) => {
    queryClient.setQueryData(["trolleys"], (oldTrolleys: Trolley[] | undefined) => {
      if (!oldTrolleys) return [updatedTrolley];
      const exists = oldTrolleys.find(t => t.id === updatedTrolley.id);
      if (exists) {
        return oldTrolleys.map(t =>
          t.id === updatedTrolley.id
            ? {
              ...t,
              ...updatedTrolley,
              // Preserve existing items if websocket payload does not include them
              items: (updatedTrolley as any).items ?? t.items,
            }
            : t
        );
      }
      return [updatedTrolley, ...oldTrolleys];
    });
  }, [queryClient]);

  useWebSocket("/topic/trolleys", handleWebSocketMessage);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in flex items-center justify-center min-h-[200px]">
        <span className="text-muted-foreground">Loading trolleys...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Active Trolleys</h1>
          <p className="text-muted-foreground mt-1">Monitor all trolleys and add new RFID trolleys</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {trolleys.filter(t => t.status === 'active').length} Online
          </span>
        </div>
      </div>

      {/* Add New Trolley */}
      <div className="bg-card rounded-xl shadow-card border border-border/50 p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add New Trolley
        </h2>
        <form onSubmit={handleAddTrolley} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative w-full">
            <Radio className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter RFID UID (e.g. D9 1F AB 4 or 53 2D D5 5)"
              value={newUid}
              onChange={(e) => setNewUid(e.target.value)}
              className="pl-10 w-full text-sm sm:text-base"
            />
          </div>
          <Button type="submit" disabled={isAdding || !newUid.trim()} className="w-full sm:w-auto">
            {isAdding ? "Adding..." : "Add Trolley"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Each physical trolley has a unique RFID tag. Enter its UID to register it in the system.
        </p>
      </div>

      {/* Trolleys Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trolleys.map((trolley) => (
          <div
            key={trolley.id}
            className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden hover:shadow-card-hover transition-shadow"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${trolley.status === 'active' ? 'bg-primary/10' : 'bg-warning/10'
                  }`}>
                  <ShoppingCart className={`h-5 w-5 ${trolley.status === 'active' ? 'text-primary' : 'text-warning'
                    }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{trolley.uid || trolley.id}</h3>
                  <p className="text-xs text-muted-foreground">{trolley.id}</p>
                  <StatusBadge
                    variant={trolley.status === 'active' ? 'success' : 'warning'}
                    pulse={trolley.status === 'active'}
                  >
                    {trolley.status.replace('_', ' ')}
                  </StatusBadge>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{trolley.customerName || 'Guest Customer'}</span>
              </div>
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {trolley.items.filter(i => i.status === 'added').length} items
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  Last activity: {new Date(trolley.lastActivity).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-lg font-bold text-foreground">₹{trolley.totalAmount.toFixed(2)}</p>
              </div>
              <StatusBadge variant={trolley.weightVerified ? 'success' : 'error'}>
                {trolley.weightVerified ? 'Weight OK' : 'Mismatch'}
              </StatusBadge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
