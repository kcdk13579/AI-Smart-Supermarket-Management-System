import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  ShoppingCart,
  Wallet,
  Smartphone,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { checkoutCart } from "@/api";

export default function CustomerPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('card');

  const { totalAmount = 20.96, itemCount = 4 } = location.state || {};

  const paymentMethods = [
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { id: 'wallet', label: 'Digital Wallet', icon: Wallet },
    { id: 'upi', label: 'UPI Payment', icon: Smartphone },
    { id: 'netbanking', label: 'Net Banking', icon: Building2 },
  ];

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      await checkoutCart();
      setIsProcessing(false);
      setIsSuccess(true);

      toast({
        title: "Payment Successful!",
        description: "Thank you for shopping with SmartMart.",
      });
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error && error.message
            ? error.message
            : "There was an error processing your payment.",
        variant: "destructive",
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center animate-scale-in">
          <div className="bg-card rounded-2xl shadow-card-hover border border-border/50 p-8 sm:p-12">
            {/* Success Animation */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-success flex items-center justify-center animate-pulse-success">
                <CheckCircle2 className="h-12 w-12 text-success-foreground" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">
              Your transaction has been completed successfully.
            </p>

            <div className="bg-muted/50 rounded-xl p-4 mb-8">
              <p className="text-sm text-muted-foreground">Amount Paid</p>
              <p className="text-3xl font-bold text-foreground">₹{totalAmount.toFixed(2)}</p>
            </div>

            <div className="p-4 bg-accent/50 rounded-xl mb-6">
              <p className="text-sm font-medium text-accent-foreground">
                Scan your trolley RFID at the exit gate. Gate opens only after payment — thank you for shopping with SmartMart!
              </p>
            </div>

            <Button
              onClick={() => navigate('/customer/login')}
              className="w-full h-12 gradient-primary text-primary-foreground font-semibold"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="gradient-primary p-2 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Checkout</h1>
                <p className="text-xs text-muted-foreground">SmartMart</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-5 gap-6">
          {/* Payment Methods */}
          <div className="md:col-span-3">
            <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Select Payment Method</h2>
              </div>
              <div className="p-4 space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${selectedMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                  >
                    <div className={`p-3 rounded-lg ${selectedMethod === method.id ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                      <method.icon className={`h-5 w-5 ${selectedMethod === method.id ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                    </div>
                    <span className={`font-medium ${selectedMethod === method.id ? 'text-primary' : 'text-foreground'
                      }`}>
                      {method.label}
                    </span>
                    {selectedMethod === method.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-2 order-first md:order-last">
            <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items ({itemCount})</span>
                  <span className="font-medium text-foreground">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium text-foreground">₹0.00</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-foreground">₹{totalAmount.toFixed(2)}</span>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full h-12 mt-4 gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Pay ₹{totalAmount.toFixed(2)}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
