import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Products from './pages/Products';
import POS from './pages/POS';
import Orders from './pages/Orders'; 
import Shifts from './pages/Shifts'
import Categories from './pages/Categories';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
            path="/products"
            element={
                <ProtectedRoute>
                    <Products />
                </ProtectedRoute>
            }
              />
        <Route
            path="/pos"
            element={
                <ProtectedRoute>
                    <POS />
                </ProtectedRoute>
            }
        />
        <Route
            path="/orders"
            element={
                <ProtectedRoute>
                    <Orders />
                </ProtectedRoute>
            }
        />
        <Route
            path="/shifts"
            element={
                <ProtectedRoute>
                    <Shifts />
                </ProtectedRoute>
            }
        />
        <Route
            path="/categories"
            element={
                <ProtectedRoute>
                    <Categories />
                </ProtectedRoute>
            }
        />
      </Routes>
    </BrowserRouter>
    
  );
}

export default App;