import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Package, Users, Clock, ShoppingCart, Wallet, LogOut, Folder } from 'lucide-react';

// Use a simple Button fallback if that import is also failing
const Button = ({ children, className, variant, ...props }) => (
    <button className={`px-4 py-2 rounded-md transition-colors ${className}`} {...props}>
        {children}
    </button>
);

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
        { path: '/products', label: 'Products', icon: Package },
        { path: '/pos', label: 'POS', icon: ShoppingCart },
        { path: '/orders', label: 'Orders', icon: Clock },
        { path: '/categories', label: 'Categories',icon : Folder },
        { path: '/customers', label: 'Customers', icon: Users },
        { path: '/shifts', label: 'Shifts', icon: Wallet },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Simple custom separator replacement
    const CustomSeparator = () => <div className="h-[1px] w-full bg-white/10 my-2" />;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
                {/* Logo */}
                <div className="p-6">
                    <div className="text-2xl font-bold">QuickPOS</div>
                </div>

                <CustomSeparator />

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                            <Button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 h-12 transition-all ${
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-slate-800'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Button>
                        );
                    })}
                </nav>

                <CustomSeparator />

                {/* User Profile & Logout */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{user?.username || 'User'}</div>
                            <div className="text-xs text-gray-400 capitalize">
                                {user?.role || 'cashier'}
                            </div>
                        </div>
                    </div>
                    
                    <Button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 h-10 text-gray-300 hover:bg-red-500/10 hover:text-red-500"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-auto">
                {children}
            </div>
        </div>
    );
};

export default Layout;