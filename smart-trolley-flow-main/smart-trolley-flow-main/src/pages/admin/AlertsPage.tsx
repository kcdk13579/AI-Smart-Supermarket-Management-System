import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "@/types";
import { getAlerts, resolveAlert } from "@/api";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Scale,
  LogOut,
  Settings2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: getAlerts,
  });
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const { toast } = useToast();

  const handleWebSocketMessage = useCallback((newAlert: Alert) => {
    queryClient.setQueryData(["alerts"], (oldAlerts: Alert[] | undefined) => {
      if (!oldAlerts) return [newAlert];
      const exists = oldAlerts.find(a => a.id === newAlert.id);
      if (exists) {
        return oldAlerts.map(a => a.id === newAlert.id ? newAlert : a);
      }
      return [newAlert, ...oldAlerts];
    });

    if (!newAlert.resolved) {
      toast({
        title: "New Security Alert",
        description: `${newAlert.message} (Trolley: ${newAlert.trolleyId})`,
        variant: "destructive",
      });
    }
  }, [queryClient, toast]);

  useWebSocket("/topic/alerts", handleWebSocketMessage);

  const resolveMutation = useMutation({
    mutationFn: resolveAlert,
    onSuccess: (_data, alertId) => {
      // Optimistically update the resolved status locally for instant UI feedback
      queryClient.setQueryData(["alerts"], (oldAlerts: Alert[] | undefined) => {
        if (!oldAlerts) return oldAlerts;
        return oldAlerts.map((a) =>
          a.id === alertId ? { ...a, resolved: true } : a
        );
      });

      toast({
        title: "Alert Resolved",
        description: "The alert has been marked as resolved.",
      });
    },
    onError: (err) =>
      toast({
        title: "Error",
        description: String(err),
        variant: "destructive",
      }),
  });

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') return !alert.resolved;
    if (filter === 'resolved') return alert.resolved;
    return true;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'weight_mismatch':
        return Scale;
      case 'unpaid_exit':
        return LogOut;
      default:
        return Settings2;
    }
  };

  const handleResolve = (alertId: string) => {
    resolveMutation.mutate(alertId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in flex items-center justify-center min-h-[200px]">
        <span className="text-muted-foreground">Loading alerts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Security Alerts</h1>
          <p className="text-muted-foreground mt-1">Monitor and resolve system alerts</p>
        </div>
        <div className="flex items-center gap-2 bg-card rounded-lg p-1 border border-border">
          {(['all', 'active', 'resolved'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? 'gradient-primary text-primary-foreground' : ''}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {alerts.filter(a => !a.resolved).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Scale className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {alerts.filter(a => a.type === 'weight_mismatch' && !a.resolved).length}
              </p>
              <p className="text-sm text-muted-foreground">Weight Issues</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {alerts.filter(a => a.resolved).length}
              </p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <div className="divide-y divide-border">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">All clear!</h3>
              <p className="text-muted-foreground">No alerts match your current filter.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 ${alert.resolved ? 'bg-muted/30' : ''
                    }`}
                >
                  <div className={`p-3 rounded-lg shrink-0 ${alert.resolved
                    ? 'bg-muted text-muted-foreground'
                    : alert.severity === 'high'
                      ? 'bg-destructive/10 text-destructive'
                      : alert.severity === 'medium'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-info/10 text-info'
                    }`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-semibold ${alert.resolved ? 'text-muted-foreground' : 'text-foreground'
                        }`}>
                        {alert.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </h3>
                      <StatusBadge
                        variant={
                          alert.resolved
                            ? 'neutral'
                            : alert.severity === 'high'
                              ? 'error'
                              : alert.severity === 'medium'
                                ? 'warning'
                                : 'info'
                        }
                      >
                        {alert.resolved ? 'Resolved' : alert.severity}
                      </StatusBadge>
                    </div>
                    <p className={`text-sm mt-1 ${alert.resolved ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                      <span>Trolley: {alert.trolleyId}</span>
                    </div>
                  </div>

                  {!alert.resolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                      className="shrink-0"
                      disabled={resolveMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {resolveMutation.isPending ? "Resolving..." : "Resolve"}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
