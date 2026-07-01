import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  CreditCard,
  Check,
  Clock,
  Scan,
  Plus,
  Minus,
  QrCode,
} from "lucide-react";

import { CustomerHeader } from "@/components/layout/CustomerHeader";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentCustomerTrolley, getProducts, updateCartItemQuantity, toggleCartItem } from "@/api";
import { CartItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { data: customerData, isLoading, refetch } = useQuery({
    queryKey: ["customer", "me"],
    queryFn: getCurrentCustomerTrolley,
  });
  const cartItems = customerData?.cartItems ?? [];
  const trolley = customerData?.trolley;
  const customerName = customerData?.customerName ?? "Customer";
  const trolleyId = trolley?.id ?? "—";
  const [manualBarcode, setManualBarcode] = useState("");

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showScanner, setShowScanner] = useState(false);
  const [scannerKey, setScannerKey] = useState(0); // For forcing re-render of scanner element
  const { toast } = useToast();

  const combinedCartItems = cartItems;
  const activeItems = combinedCartItems.filter(item => item.status === "added");

  const getItemQuantity = (itemId: string) => quantities[itemId] ?? 1;
  const totalAmount = activeItems.reduce((sum, item) => sum + item.product.price * getItemQuantity(item.id), 0);
  const totalItemCount = activeItems.reduce((sum, item) => sum + getItemQuantity(item.id), 0);

  // Initialize quantities from backend when loaded
  useEffect(() => {
    if (cartItems.length > 0) {
      setQuantities(prev => {
        const next = { ...prev };
        let changed = false;
        cartItems.forEach(item => {
          if (next[item.id] === undefined) {
            next[item.id] = item.quantity ?? 1;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [cartItems]);

  const handleQuantityChange = async (itemId: string, delta: number) => {
    const current = quantities[itemId] ?? 1;
    const next = current + delta;
    if (next < 1) return;

    // Optimistic update
    setQuantities(prev => ({ ...prev, [itemId]: next }));

    try {
      await updateCartItemQuantity(itemId, next);
    } catch (error) {
      console.error("Failed to update quantity on server:", error);
      // Revert on failure
      setQuantities(prev => ({ ...prev, [itemId]: current }));
      toast({
        title: "Update failed",
        description: "Could not update item quantity on the server.",
        variant: "destructive",
      });
    }
  };

  const handleManualScan = async () => {
    const trimmed = manualBarcode.trim();
    if (!trimmed) {
      toast({
        title: "Barcode required",
        description: "Please enter a barcode number to add an item.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingItem(true);
      const products = await getProducts();
      const product = products.find((p) => p.barcode === trimmed);

      if (!product) {
        toast({
          title: "Product not found",
          description: "No product was found with that barcode.",
          variant: "destructive",
        });
        return;
      }

      await toggleCartItem(product.barcode);
      await refetch();

      toast({
        title: "Cart Updated",
        description: `Toggled ${product.name} in cart.`,
      });

      setManualBarcode("");
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to add item",
        description: "There was a problem looking up that barcode.",
        variant: "destructive",
      });
    } finally {
      setIsAddingItem(false);
    }
  };

  const processScannedBarcode = async (decodedText: string) => {
    const normalizedBarcode = decodedText.trim();
    if (!normalizedBarcode) {
      return;
    }
    // Process the scanned code using the existing manual scan logic
    setManualBarcode(normalizedBarcode);

    try {
      setIsAddingItem(true);
      const products = await getProducts();
      const product = products.find((p) => p.barcode === normalizedBarcode);

      if (!product) {
        toast({
          title: "Product not found",
          description: `No product was found with barcode: ${normalizedBarcode}`,
          variant: "destructive",
        });
        return;
      }

      await toggleCartItem(product.barcode);
      await refetch();

      toast({
        title: "Cart Updated",
        description: `Toggled ${product.name} in cart.`,
      });

      // Clear manual input and hide scanner after successful scan
      setManualBarcode("");
      setShowScanner(false);

    } catch (error) {
      console.error(error);
      toast({
        title: "Scan Error",
        description: "There was a problem processing the scanned barcode.",
        variant: "destructive",
      });
    } finally {
      setIsAddingItem(false);
    }
  };

  useEffect(() => {
    let html5Qrcode: Html5Qrcode | null = null;
    let isComponentMounted = true;

    if (showScanner) {
      const formatsToSupport = [
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.CODABAR,
        Html5QrcodeSupportedFormats.QR_CODE,
      ];

      // Need a slight delay to ensure the modal DOM is rendered before scanner attaches
      const timer = setTimeout(() => {
        if (!isComponentMounted) return;
        
        html5Qrcode = new Html5Qrcode("qr-reader", {
          formatsToSupport,
          experimentalFeatures: { useBarCodeDetectorIfSupported: true },
          verbose: false
        });
        
        html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 320, height: 200 },
            aspectRatio: 4 / 3,
          },
          (decodedText) => {
            if (isComponentMounted) {
              if (html5Qrcode && html5Qrcode.isScanning) {
                html5Qrcode.pause();
              }
              processScannedBarcode(decodedText);
            }
          },
          (errorMessage) => {
            // Ignore parse errors as it scans every frame
          }
        ).catch((err) => {
          console.error("Failed to start scanner:", err);
          if (isComponentMounted) {
            toast({
              title: "Camera Error",
              description: "Could not access the camera. Please check permissions.",
              variant: "destructive",
            });
          }
        });
      }, 300);

      return () => {
        isComponentMounted = false;
        clearTimeout(timer);
        if (html5Qrcode && html5Qrcode.isScanning) {
          html5Qrcode.stop().catch(console.error).finally(() => {
            html5Qrcode?.clear();
          });
        }
      };
    }
  }, [showScanner, scannerKey]);

  const handlePayment = () => {
    navigate("/customer/payment", { state: { totalAmount, itemCount: totalItemCount } });
  };

  useEffect(() => {
    if (!isLoading && !customerData) {
      navigate("/customer/select-trolley", { replace: true });
    }
  }, [isLoading, customerData, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!customerData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader
        customerName={customerName}
        trolleyId={trolleyId}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <StatusBadge variant="success" pulse>
            <Check className="h-3.5 w-3.5" /> Trolley Active
          </StatusBadge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Cart Items</h2>
                      <p className="text-sm text-muted-foreground">{totalItemCount} items in cart</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Real-time updates</span>
                  </div>
                </div>
              </div>

              {/* Manual Barcode Entry + Items List */}
              <div className="divide-y divide-border">
                <div className="p-4 sm:px-6 bg-muted/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <Scan className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter barcode number manually"
                        value={manualBarcode}
                        onChange={(e) => setManualBarcode(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <Button
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={handleManualScan}
                      disabled={isAddingItem || !manualBarcode.trim()}
                    >
                      {isAddingItem ? "Adding..." : "Add"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setScannerKey(prev => prev + 1);
                        setShowScanner(true);
                      }}
                      disabled={isAddingItem}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Scan Barcode
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can type a barcode if the scanner is unavailable. Entering or scanning the same barcode again will remove it.
                  </p>
                </div>

                {combinedCartItems.length === 0 ? (
                  <div className="p-12 text-center">
                    <Scan className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No items scanned</h3>
                    <p className="text-muted-foreground">
                      Start scanning products or enter a barcode manually to add them to your cart
                    </p>
                  </div>
                ) : (
                  combinedCartItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`p-4 sm:px-6 flex items-center justify-between animate-slide-up ${item.status === 'removed' ? 'bg-muted/50' : ''
                        }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.status === 'removed' ? 'bg-destructive/10' : 'bg-accent'
                          }`}>
                          <ShoppingBag className={`h-6 w-6 ${item.status === 'removed' ? 'text-destructive' : 'text-accent-foreground'
                            }`} />
                        </div>
                        <div>
                          <h3 className={`font-medium ${item.status === 'removed' ? 'text-muted-foreground line-through' : 'text-foreground'
                            }`}>
                            {item.product.name}
                          </h3>
                          {item.product.barcode && (
                            <p className="text-xs text-muted-foreground">
                              Barcode: {item.product.barcode}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Scanned at {new Date(item.scannedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-semibold ${item.status === 'removed' ? 'text-muted-foreground' : 'text-foreground'
                          }`}>
                          ₹{(item.product.price * getItemQuantity(item.id)).toFixed(2)}
                        </span>

                        {item.status === 'added' && (
                          <div className="flex items-center gap-2 bg-secondary/10 rounded-lg p-1 mr-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="p-1 hover:bg-secondary/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={getItemQuantity(item.id) <= 1}
                            >
                              <Minus className="h-4 w-4 text-secondary" />
                            </button>
                            <span className="w-6 text-center font-medium text-sm">
                              {getItemQuantity(item.id)}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="p-1 hover:bg-secondary/20 rounded-md transition-colors"
                            >
                              <Plus className="h-4 w-4 text-secondary" />
                            </button>
                          </div>
                        )}

                        <StatusBadge variant={item.status === 'added' ? 'success' : 'error'}>
                          {item.status === 'added' ? 'Added' : 'Removed'}
                        </StatusBadge>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Remove Item Notice */}
              <div className="p-4 bg-info/5 border-t border-info/20">
                <p className="text-sm text-info flex items-center gap-2">
                  <Scan className="h-4 w-4" />
                  To remove an item, please scan or enter the same product barcode again.
                </p>
              </div>
            </div>
          </div>

          {/* Bill Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden sticky top-24">
              <div className="p-4 sm:p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-secondary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Bill Summary</h2>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                {/* Total */}
                <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-4xl font-bold text-foreground">₹{totalAmount.toFixed(2)}</p>
                </div>

                {/* Summary Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items in Cart</span>
                    <span className="font-medium text-foreground">{totalItemCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Removed Items</span>
                    <span className="font-medium text-foreground">
                      {cartItems.filter(i => i.status === 'removed').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trolley ID</span>
                    <span className="font-medium text-foreground">{trolleyId}</span>
                  </div>
                </div>

                {/* Pay Button */}
                <Button
                  onClick={handlePayment}
                  className="w-full h-12 gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-all"
                  disabled={activeItems.length === 0}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Barcode Scanner Modal */}
        <Dialog open={showScanner} onOpenChange={setShowScanner}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Scan Barcode</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-4">
              <div
                id="qr-reader"
                className="w-full min-h-[300px] overflow-hidden rounded-lg border border-border bg-black"
              ></div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Point your camera at a product barcode to add or remove it from your cart.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
