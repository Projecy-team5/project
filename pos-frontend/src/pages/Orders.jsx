import axios from 'axios';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Receipt, 
  Calendar, 
  User, 
  CreditCard, 
  DollarSign, 
  Eye, 
  X,
  Package,
  TrendingUp,
  Loader2
} from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('https://localhost:7048/api/Orders');
                setOrders(res.data);
            } catch (err) {
                console.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const viewDetails = async (id) => {
        try {
            const res = await axios.get(`https://localhost:7048/api/Orders/${id}`);
            setSelectedOrder(res.data);
        } catch (err) {
            console.error('Failed to load order details');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentBadgeVariant = (method) => {
        switch (method?.toLowerCase()) {
            case 'cash': return 'success';
            case 'card': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Receipt className="h-8 w-8" />
                        Orders History
                    </h1>
                    <p className="text-muted-foreground">View and manage all your orders</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1">
                        {orders.length} Orders
                    </Badge>
                </div>
            </div>

            {/* Orders Table Card */}
            <Card>
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                    <CardDescription>A complete list of all orders placed in the system</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Loading orders...</span>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No orders found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Order #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">
                                            <Badge variant="outline" className="font-mono">
                                                #{order.orderNumber}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {formatDate(order.createdAt)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                {order.customerName || 'Walk-in Customer'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getPaymentBadgeVariant(order.paymentMethod)}>
                                                {order.paymentMethod}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="font-semibold">${order.total.toFixed(2)}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => viewDetails(order.id)}
                                                className="gap-1"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Order Details Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            Order #{selectedOrder?.order?.orderNumber}
                        </DialogTitle>
                        <DialogDescription>
                            Order details and items
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Date:</span>
                                        <span className="text-sm font-medium">{formatDate(selectedOrder.order.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Customer:</span>
                                        <span className="text-sm font-medium">{selectedOrder.order.customerName || 'Walk-in Customer'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Payment:</span>
                                        <Badge variant={getPaymentBadgeVariant(selectedOrder.order.paymentMethod)}>
                                            {selectedOrder.order.paymentMethod}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2 text-right">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span>${selectedOrder.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax:</span>
                                        <span>${selectedOrder.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Discount:</span>
                                        <span>-${selectedOrder.discount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                        <span>Total:</span>
                                        <span className="text-green-600">${selectedOrder.order.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Paid:</span>
                                        <span>${selectedOrder.paidAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Change:</span>
                                        <span>${selectedOrder.change.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Order Items
                                </h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedOrder.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.productName}</TableCell>
                                                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline">{item.quantity}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">${item.total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                            <X className="h-4 w-4 mr-1" />
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Orders;
