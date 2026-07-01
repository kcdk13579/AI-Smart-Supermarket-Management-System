import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Scan, 
  Scale, 
  CreditCard, 
  Shield, 
  BarChart3,
  ArrowRight,
  Wifi,
  Smartphone,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Scan,
    title: "Barcode Scanning",
    description: "Instantly scan products with IoT-enabled trolleys for real-time cart updates.",
  },
  {
    icon: Scale,
    title: "Weight Verification",
    description: "Smart sensors verify cart contents to prevent theft and discrepancies.",
  },
  {
    icon: CreditCard,
    title: "Seamless Checkout",
    description: "Pay directly from your cart without waiting in queues.",
  },
  {
    icon: Shield,
    title: "Security Alerts",
    description: "Real-time monitoring for weight mismatches and unpaid exit attempts.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive sales reports and trolley activity monitoring for admins.",
  },
  {
    icon: Wifi,
    title: "IoT Connected",
    description: "All trolleys connected via IoT for seamless communication and tracking.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="gradient-primary p-2 rounded-lg">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground hidden sm:inline-block">SmartMart</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 flex-wrap justify-end ml-2">
              <Link to="/customer/register">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3 text-xs sm:text-sm">Register</Button>
              </Link>
              <Link to="/customer/login">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3 text-xs sm:text-sm">Login</Button>
              </Link>
              <Link to="/admin/login">
                <Button variant="outline" size="sm" className="px-2 sm:px-3 text-xs sm:text-sm">Admin</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-in">
              <Wifi className="h-4 w-4" />
              IoT-Enabled Shopping Experience
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
              The Future of{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Smart Shopping
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Experience seamless supermarket shopping with our IoT-enabled smart trolley system. 
              Scan, shop, and pay without the hassle of traditional checkout lines.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/customer/login">
                <Button size="lg" className="gradient-primary text-primary-foreground font-semibold px-8 h-12">
                  Start Shopping
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button size="lg" variant="outline" className="font-semibold px-8 h-12">
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {[
              { value: "500+", label: "Products" },
              { value: "50+", label: "Smart Trolleys" },
              { value: "1000+", label: "Daily Transactions" },
              { value: "0", label: "Wait Time" },
            ].map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center p-6 bg-card rounded-xl shadow-card animate-scale-in"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our smart supermarket system combines IoT technology with intuitive design 
              to revolutionize your shopping experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50 group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple, fast, and secure shopping in four easy steps.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "1", icon: Users, title: "Login", desc: "Sign in with your customer account" },
              { step: "2", icon: ShoppingCart, title: "Get Trolley", desc: "Pick up an assigned smart trolley" },
              { step: "3", icon: Scan, title: "Scan & Shop", desc: "Scan products as you add them" },
              { step: "4", icon: CreditCard, title: "Pay & Go", desc: "Complete payment and exit" },
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                    <item.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Experience Smart Shopping?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of customers enjoying a seamless, queue-free shopping experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/customer/login">
              <Button size="lg" className="gradient-primary text-primary-foreground font-semibold px-8 h-12">
                <Smartphone className="h-5 w-5 mr-2" />
                Customer Portal
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button size="lg" variant="outline" className="font-semibold px-8 h-12">
                <Shield className="h-5 w-5 mr-2" />
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="gradient-primary p-2 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-sidebar-foreground">SmartMart</span>
            </div>
            <p className="text-sm text-sidebar-foreground/60">
              © 2024 SmartMart. Smart Supermarket Management System with IoT-Enabled Trolley.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
