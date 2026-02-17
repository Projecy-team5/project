import axios from 'axios';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp, 
  LogOut, 
  Package, 
  Users,
  ArrowRight,
  Clock
} from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        todaySales: 0,
        todayOrders: 0,
        lowStockProducts: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('https://localhost:7048/api/Dashboard/stats');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to load stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-lg border">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(user?.username)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{user?.username}</span>
                            <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                        </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${stats.todaySales.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">+12%</span> from yesterday
                        </p>
                    </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.todayOrders}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Users className="h-3 w-3 text-blue-500" />
                            <span className="text-blue-500">+8%</span> from yesterday
                        </p>
                    </CardContent>
                </Card>
                
                <Card className={`border-l-4 ${stats.lowStockProducts.length > 0 ? 'border-l-red-500' : 'border-l-green-500'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${stats.lowStockProducts.length > 0 ? 'text-red-500' : 'text-green-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${stats.lowStockProducts.length > 0 ? 'text-red-600' : ''}`}>
                            {stats.lowStockProducts.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.lowStockProducts.length > 0 
                                ? 'Products need restocking' 
                                : 'All products well stocked'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>
                            Frequently used actions for faster workflow
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.location.href = '/pos'}>
                            <ShoppingCart className="h-4 w-4 text-blue-500" />
                            New Sale
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.location.href = '/orders'}>
                            <DollarSign className="h-4 w-4 text-green-500" />
                            View Orders
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.location.href = '/products'}>
                            <Package className="h-4 w-4 text-purple-500" />
                            Products
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.location.href = '/shifts'}>
                            <Clock className="h-4 w-4 text-orange-500" />
                            Shifts
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Account Summary
                        </CardTitle>
                        <CardDescription>
                            Your account information at a glance
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Username</span>
                            <span className="text-sm font-medium">{user?.username}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Role</span>
                            <Badge variant="secondary" className="capitalize">{user?.role}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge variant="success">Active</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Products Table */}
            {stats.lowStockProducts.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <CardTitle>Low Stock Products</CardTitle>
                            </div>
                            <Badge variant="destructive">{stats.lowStockProducts.length} items</Badge>
                        </div>
                        <CardDescription>
                            Products that are running low and need to be restocked
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead className="text-right">Current Stock</TableHead>
                                    <TableHead className="text-right">Min Required</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.lowStockProducts.map((product) => (
                                    <TableRow key={product.sku}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{product.sku}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-red-600 font-semibold">{product.quantity}</span>
                                        </TableCell>
                                        <TableCell className="text-right">{product.minQuantity}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge 
                                                variant={product.quantity === 0 ? "destructive" : "warning"}
                                            >
                                                {product.quantity === 0 ? "Out of Stock" : "Low Stock"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Welcome Message (shown when no low stock) */}
            {stats.lowStockProducts.length === 0 && !loading && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-green-800 dark:text-green-200">Everything looks great!</h3>
                                <p className="text-sm text-green-600 dark:text-green-300">
                                    All products are well stocked. Great job keeping inventory up to date!
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {loading && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="pb-2">
                                <div className="h-4 bg-muted rounded w-24"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-muted rounded w-32"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
