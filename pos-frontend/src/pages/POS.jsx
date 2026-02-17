import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectItem 
} from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
  ShoppingCart, Search, Trash2, 
  Minus, Plus, X, Package, ScanBarcode 
} from 'lucide-react';

// SET YOUR BACKEND PORT HERE
const API_BASE = 'https://localhost:7048/api'; 

const POS = () => {
  const { user } = useAuth();
  
  // --- States ---
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [discountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState(0);
  
  const [paymentModal, setPaymentModal] = useState(false);
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [processing, setProcessing] = useState(false);

  const searchInputRef = useRef(null);

  // --- Initial Sync ---
  useEffect(() => {
    const init = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          axios.get(`${API_BASE}/Products`),
          axios.get(`${API_BASE}/Categories`)
        ]);
        setProducts(pRes.data || []);
        setCategories(cRes.data || []);
      } catch (err) {
        console.error("Sync error:", err);
        setProducts([]);
        setCategories([]);
      }
    };
    init();
    searchInputRef.current?.focus();
  }, []);

  // --- Calculations ---
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = discountType === 'percent' ? subtotal * (discountValue / 100) : Number(discountValue);
  const total = (subtotal - discountAmount) * 1.10; // Assuming 10% tax
  const changeDue = parseFloat(paidAmount || 0) - total;

  // --- Cart Actions ---
  const addToCart = (product) => {
    if ((product.stockQuantity || 0) <= 0) return toast.error("Out of Stock");

    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id 
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * (i.currentPrice || 0) } 
          : i);
      }
      return [...prev, { ...product, quantity: 1, total: product.currentPrice || 0 }];
    });
    setSearch('');
    searchInputRef.current?.focus();
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * (item.currentPrice || 0) };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  // --- Barcode / Search Logic ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    // 1. Try local list (fastest)
    const localMatch = products.find(p => p.sku === search || p.barcode === search);
    if (localMatch) {
      addToCart(localMatch);
    } else {
      // 2. Try Server Search
      try {
        const res = await axios.get(`${API_BASE}/Products/search?q=${search}`);
        if (res.data.length > 0) addToCart(res.data[0]);
        else toast.error("Product Not Found");
      } catch {
        toast.error("Search Failed");
      }
    }
  };

  // --- Printing System ---
  const printReceipt = (orderData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups for printing");
      return;
    }
    
    // Get items from order response or fallback to cart
    const receiptItems = orderData?.items || cart;
    const receiptTotal = orderData?.total || total;
    const receiptPaid = orderData?.paidAmount || parseFloat(paidAmount || total);
    const receiptChange = parseFloat(receiptPaid) - receiptTotal;
    
    const receiptContent = `
      <html>
        <head><title>Receipt #${orderData?.id || orderData?.orderNumber}</title></head>
        <body style="font-family: monospace; width: 300px; padding: 10px;">
          <h2 style="text-align:center">RETAIL STORE</h2>
          <p>Order: ${orderData?.orderNumber || orderData?.id || 'N/A'}</p>
          <hr/>
          ${receiptItems.map(i => `<div>${i.name || i.productName} x${i.quantity} @ $${((i.currentPrice || i.price || 0) * i.quantity).toFixed(2)}</div>`).join('')}
          <hr/>
          <b>TOTAL: $${receiptTotal.toFixed(2)}</b>
          <p>Paid: $${receiptPaid.toFixed(2)}</p>
          <p>Change: $${(receiptChange > 0 ? receiptChange : 0).toFixed(2)}</p>
          <p style="text-align:center">Thank you!</p>
        </body>
      </html>
    `;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
  };

  // --- Complete Sale ---
  const completeSale = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const payload = {
        items: cart.map(i => ({ productId: i.id, quantity: i.quantity })),
        paymentMethod,
        paidAmount: parseFloat(paidAmount) || total,
        discount: discountAmount,
        customerId: null
      };
      const res = await axios.post(`${API_BASE}/Orders`, payload);
      printReceipt(res.data);
      setCart([]);
      setPaymentModal(false);
      setPaidAmount('');
      setDiscountValue(0);
      toast.success("Transaction Complete");
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || "Server Error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-4 max-w-[1400px] mx-auto space-y-4">
      <Toaster position="top-right" />
      
      {/* Top Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
          <ScanBarcode className="h-8 w-8" /> TERMINAL
        </h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-md px-4 py-1">{user?.username || 'Cashier'}</Badge>
          <Button variant="ghost" onClick={() => window.location.reload()}><Trash2 className="h-4 w-4"/></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Product Section (Left) */}
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardContent className="p-4 flex gap-4">
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  ref={searchInputRef}
                  placeholder="Scan SKU or Product Name..." 
                  className="pl-10 h-12"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} className="w-[200px] h-12">
                <SelectItem value="all">All Items</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
              </Select>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[65vh] overflow-y-auto pr-2">
            {products
              .filter(p => selectedCategory === 'all' || (p.categoryId || p.category?.id)?.toString() === selectedCategory)
              .map(p => (
                <Card 
                  key={p.id} 
                  className="cursor-pointer hover:border-primary hover:shadow-md transition-all active:scale-95"
                  onClick={() => addToCart(p)}
                >
                  <CardContent className="p-4 flex flex-col items-center">
                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-2">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-sm line-clamp-1">{p.name}</p>
                    <p className="text-green-600 font-bold">${(p.currentPrice || 0).toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">Qty: {p.stockQuantity ?? 0}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Cart Section (Right) */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col border-2 border-primary/20 shadow-xl">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Current Order
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-muted/30 p-2 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">${(item.currentPrice || 0).toFixed(2)} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQty(item.id, -1)}><Minus/></Button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQty(item.id, 1)}><Plus/></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => removeFromCart(item.id)}><X/></Button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">Cart is empty</div>
              )}
            </CardContent>
            
            <div className="p-4 bg-muted/20 border-t space-y-3">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-red-500">
                <span>Discount</span>
                <div className="flex items-center gap-2">
                   <Input 
                    type="number" 
                    className="w-16 h-8 text-right" 
                    value={discountValue} 
                    onChange={(e) => setDiscountValue(e.target.value)}
                   />
                   <span>{discountType === 'percent' ? '%' : '$'}</span>
                </div>
              </div>
              <div className="flex justify-between font-black text-2xl pt-2 border-t">
                <span>TOTAL</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-700"
                disabled={cart.length === 0}
                onClick={() => setPaymentModal(true)}
              >
                CHECKOUT
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentModal} onOpenChange={setPaymentModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Finalize Payment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center p-6 bg-primary/5 rounded-lg border-2 border-dashed border-primary">
              <p className="text-sm uppercase tracking-widest font-bold text-muted-foreground">Total Due</p>
              <h2 className="text-5xl font-black text-primary">${total.toFixed(2)}</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Method</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Credit Card</SelectItem>
                  <SelectItem value="Transfer">Bank Transfer</SelectItem>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Paid Amount</label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={paidAmount}
                  className="text-lg font-bold"
                  onChange={(e) => setPaidAmount(e.target.value)}
                />
              </div>
            </div>
            {changeDue >= 0 && (
              <div className="p-3 bg-green-100 text-green-800 rounded-lg flex justify-between font-bold">
                <span>Change to Return:</span>
                <span>${changeDue.toFixed(2)}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModal(false)}>Cancel</Button>
            <Button 
              className="bg-green-600 px-10 h-12" 
              onClick={completeSale}
              disabled={processing || (paymentMethod === 'Cash' && changeDue < 0)}
            >
              {processing ? "Saving..." : "PRINT & FINISH"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POS;
