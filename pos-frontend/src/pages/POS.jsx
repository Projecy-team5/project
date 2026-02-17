import axios from 'axios';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  DollarSign, 
  CreditCard,
  Calculator,
  User,
  Package,
  Plus,
  Minus,
  X,
  CheckCircle,
  Grid,
  List,
  Tag,
  PackagePlus
} from 'lucide-react';

const POS = () => {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [paymentModal, setPaymentModal] = useState(false);
    const [paidAmount, setPaidAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [processing, setProcessing] = useState(false);
    const searchInputRef = useRef(null);

    // Focus search input on load (for barcode scanner)
    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('https://localhost:7048/api/Products');
                setProducts(res.data);
                setFilteredProducts(res.data);
            } catch (err) {
                console.error('Failed to load products');
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    // Filter products when search changes
    useEffect(() => {
        if (!search.trim()) {
            setFilteredProducts(products);
        } else {
            const searchLower = search.toLowerCase();
            const filtered = products.filter(p => 
                p.name.toLowerCase().includes(searchLower) ||
                p.sku.toLowerCase().includes(searchLower) ||
                (p.barcode && p.barcode.toLowerCase().includes(searchLower))
            );
            setFilteredProducts(filtered);
        }
    }, [search, products]);

    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    const change = parseFloat(paidAmount) - total || 0;

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.currentPrice } : i);
            }
            return [...prev, { ...product, quantity: 1, total: product.currentPrice }];
        });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!search.trim()) return;

        try {
            // First try barcode exact match
            let res = await axios.get(`https://localhost:7048/api/Products/barcode/${search}`);
            if (res.data) {
                addToCart(res.data);
                setSearch('');
                return;
            }

            // Fallback to general search (take first result)
            res = await axios.get(`https://localhost:7048/api/Products/search?q=${search}`);
            if (res.data.length > 0) {
                addToCart(res.data[0]);
            }
            setSearch('');
        } catch (err) {
            console.error('Product not found');
        }
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty, total: newQty * item.currentPrice };
            }
            return item;
        }));
    };

    const completeSale = async () => {
        if (cart.length === 0) return;

        const items = cart.map(i => ({
            productId: i.id,
            quantity: i.quantity
        }));

        const payload = {
            items,
            discount: 0,
            paymentMethod,
            paidAmount: parseFloat(paidAmount) || total
        };

        setProcessing(true);
        try {
            const res = await axios.post('https://localhost:7048/api/Orders', payload);
            alert(`Sale complete! Order ${res.data.orderNumber}\nChange: $${res.data.change.toFixed(2)}`);
            setCart([]);
            setPaymentModal(false);
            setPaidAmount('');
        } catch (err) {
            alert('Sale failed: ' + (err.response?.data || err.message));
        } finally {
            setProcessing(false);
        }
    };

    const quickAmounts = [10, 20, 50, 100];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ShoppingCart className="h-8 w-8" />
                        POS Terminal
                    </h1>
                    <p className="text-muted-foreground">Logged in as: <span className="font-medium">{user?.username}</span></p>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                    <User className="h-4 w-4 mr-1" />
                    {user?.role}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Search + Products */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Search Card */}
                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    ref={searchInputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Scan barcode or search product by name/SKU..."
                                    className="pl-10 text-lg h-14"
                                />
                            </form>
                        </CardContent>
                    </Card>

                    {/* Products Grid/List */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <PackagePlus className="h-5 w-5" />
                                    Products
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardDescription>
                                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available • Click to add to cart
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingProducts ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">Loading products...</p>
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No products found</p>
                                </div>
                            ) : viewMode === 'grid' ? (
                                /* Grid View */
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className="flex flex-col items-start p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary transition-all text-left group"
                                        >
                                            <div className="w-full h-20 bg-muted rounded-md mb-2 flex items-center justify-center">
                                                <Package className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <p className="font-medium text-sm truncate w-full">{product.name}</p>
                                            <Badge variant="outline" className="text-xs mt-1">{product.sku}</Badge>
                                            <p className="font-bold text-green-600 mt-2">${product.currentPrice.toFixed(2)}</p>
                                            <div className="mt-2 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" className="w-full h-7">
                                                    <Plus className="h-3 w-3 mr-1" /> Add
                                                </Button>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                /* List View */
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProducts.map(product => (
                                            <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50" onClick={() => addToCart(product)}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                        {product.name}
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">{product.sku}</Badge>
                                                </TableCell>
                                                <TableCell>{product.categoryName}</TableCell>
                                                <TableCell>
                                                    <Badge variant={product.stockQuantity > 10 ? 'success' : product.stockQuantity > 0 ? 'warning' : 'destructive'}>
                                                        {product.stockQuantity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">${product.currentPrice.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Button size="sm" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Cart Table */}
                    {cart.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    Cart Items
                                </CardTitle>
                                <CardDescription>
                                    {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cart.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <div>{item.name}</div>
                                                    <Badge variant="outline" className="text-xs mt-1">{item.sku}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">${item.currentPrice.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button 
                                                            variant="outline" 
                                                            size="icon" 
                                                            className="h-7 w-7"
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                        <Button 
                                                            variant="outline" 
                                                            size="icon" 
                                                            className="h-7 w-7"
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">${item.total.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => removeFromCart(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right: Order Summary */}
                <div>
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (10%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span className="text-green-600">-$0.00</span>
                                </div>
                                <div className="flex justify-between text-2xl font-bold border-t pt-4">
                                    <span>Total</span>
                                    <span className="text-green-600">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => setPaymentModal(true)}
                                disabled={cart.length === 0}
                                className="w-full h-14 text-lg gap-2 bg-green-600 hover:bg-green-700"
                            >
                                <DollarSign className="h-5 w-5" />
                                Proceed to Payment
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setCart([])}
                                disabled={cart.length === 0}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear Cart
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Payment Modal */}
            <Dialog open={paymentModal} onOpenChange={setPaymentModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment
                        </DialogTitle>
                        <DialogDescription>
                            Complete the payment to finish the order
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Amount Due */}
                        <div className="bg-muted rounded-lg p-4 text-center">
                            <p className="text-sm text-muted-foreground">Amount Due</p>
                            <p className="text-4xl font-bold text-green-600">${total.toFixed(2)}</p>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Payment Method</label>
                            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                            </Select>
                        </div>

                        {/* Amount Tendered */}
                        {paymentMethod === 'Cash' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount Tendered</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="text-lg h-12"
                                />
                                <div className="flex flex-wrap gap-2">
                                    {quickAmounts.map(amount => (
                                        <Button
                                            key={amount}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPaidAmount(amount.toString())}
                                        >
                                            ${amount}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Change */}
                        {paymentMethod === 'Cash' && paidAmount && parseFloat(paidAmount) >= total && (
                            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 text-center">
                                <p className="text-sm text-green-600 dark:text-green-400">Change Due</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">${change.toFixed(2)}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setPaymentModal(false)}
                            disabled={processing}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                        </Button>
                        <Button 
                            onClick={completeSale}
                            disabled={processing || (paymentMethod === 'Cash' && parseFloat(paidAmount) < total)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {processing ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Complete Sale
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default POS;
