import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Moon, Sun, Monitor, Save, Key, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { changePassword, getProfile, updateProfile } from "@/api/appClient";

export default function AdminSettings() {
  const { email, setAuth } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Basic Details State
  const [profile, setProfile] = useState({
    name: "Loading...",
    email: email || "",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setProfile({ name: data.name, email: data.email });
      } catch (err: any) {
        toast({
          title: "Error loading profile",
          description: err.message || "Could not fetch profile",
          variant: "destructive",
        });
      }
    }
    loadProfile();
  }, [toast]);

  // Password State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await updateProfile(profile.name, profile.email);
      // If the email changed, the backend returned a new token to keep us authenticated.
      if (response && response.token) {
        setAuth({ token: response.token, role: response.role }, profile.email);
      }
      toast({
        title: "Profile updated",
        description: "Your basic details have been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Passwords mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwords.current, passwords.new);
      setPasswords({ current: "", new: "", confirm: "" });
      toast({
        title: "Password changed",
        description: "Your password has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error changing password",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Navigation/Overview */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="border-border drop-shadow-sm">
            <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex flex-col items-center justify-center shrink-0">
                <span className="font-bold text-primary text-lg">
                  {profile.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{profile.name}</p>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                <div className="mt-1 inline-flex text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-sidebar-primary/10 text-sidebar-primary">
                  ADMINISTRATOR
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-border drop-shadow-sm">
            <div className="flex flex-col">
              <a href="#profile" className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Basic Details</span>
              </a>
              <a href="#security" className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Security</span>
              </a>
              <a href="#appearance" className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Appearance</span>
              </a>
            </div>
          </Card>
        </div>

        {/* Right Column - Forms */}
        <div className="space-y-6 flex-1 lg:col-span-3">
          {/* Basic Details Section */}
          <Card id="profile" className="border-border shadow-sm scroll-mt-24 max-w-3xl">
            <CardHeader>
              <CardTitle className="text-lg">Basic Details</CardTitle>
              <CardDescription>Update your personal information and contact details.</CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSave}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="Enter your email address"
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t border-border mt-2 pt-4 justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                  <Save className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Password Section */}
          <Card id="security" className="border-border shadow-sm scroll-mt-24 max-w-3xl">
            <CardHeader>
              <CardTitle className="text-lg">Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    required
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      required
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      required
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border mt-2 pt-4 justify-end">
                <Button type="submit" variant="outline" disabled={isChangingPassword}>
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Theme Section */}
          <Card id="appearance" className="border-border shadow-sm scroll-mt-24 max-w-3xl">
            <CardHeader>
              <CardTitle className="text-lg">Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your administrator panel.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                    theme === "light"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <Sun className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                    theme === "dark"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <Moon className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                    theme === "system"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <Monitor className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">System</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
