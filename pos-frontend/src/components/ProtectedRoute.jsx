import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from './Layout';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return user ? <Layout>{children}</Layout> : <Navigate to="/" replace />;
};

export default ProtectedRoute;