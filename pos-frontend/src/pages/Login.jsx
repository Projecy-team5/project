import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'https://localhost:7048/api/Auth/login',
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      login(response.data.token, response.data.role, response.data.username);
      navigate('/dashboard');
      } catch (err) {
          setError('Invalid username or password');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen flex items-center justify-center p-4 transition-colors duration-300 font-sans">
      {/* Dark Mode Toggle */}
      <button 
        onClick={toggleDarkMode}
        className="fixed top-6 right-6 z-50 p-2 rounded-full bg-white dark:bg-[#1e293b] shadow-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
      >
        <span className="material-icons-round block dark:hidden">dark_mode</span>
        <span className="material-icons-round hidden dark:block">light_mode</span>
      </button>

      {/* Main Card */}
      <div className="w-full max-w-5xl bg-white dark:bg-[#1e293b] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        
        {/* Left Side: Gradient Hero */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-12 flex-col justify-between relative overflow-hidden">
          {/* Decorative Blobs */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#1db9aa]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#1db9aa]/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1db9aa] rounded-xl flex items-center justify-center shadow-lg shadow-[#1db9aa]/30">
                <span className="material-icons-round text-white">payments</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">QuickPOS</span>
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Streamline your <br />
              <span className="text-[#1db9aa]">business operations</span>.
            </h1>
            <p className="text-slate-400 text-lg max-w-sm">
              Manage sales, inventory, and employees in one powerful, unified cloud-based platform.
            </p>
          </div>

          <div className="relative z-10 flex gap-4 items-center">
            <div className="flex -space-x-3">
              {[0, 1, 2].map((i) => (
                <img 
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-[#1e293b]" 
                  src={`https://i.pravatar.cc/150?img=${i + 10}`} 
                  alt="User" 
                />
              ))}
            </div>
            <div className="text-slate-400 text-sm">
              Joined by 10,000+ businesses
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white dark:bg-[#1e293b]">
          <div className="mb-10">
            {/* Mobile-only Logo */}
            <div className="flex items-center gap-3 mb-8 md:hidden">
              <div className="w-10 h-10 bg-[#1db9aa] rounded-xl flex items-center justify-center shadow-lg">
                <span className="material-icons-round text-white">payments</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">QuickPOS</span>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email or Username</label>
              <div className="relative">
                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">alternate_email</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#1db9aa] focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <a className="text-sm font-semibold text-[#1db9aa] hover:underline" href="#">Forgot?</a>
              </div>
              <div className="relative">
                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock_open</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#1db9aa] focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <span className="material-icons-round text-xl">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="remember" className="w-4 h-4 text-[#1db9aa] bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded focus:ring-[#1db9aa]" />
              <label htmlFor="remember" className="ml-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">Remember me</label>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1db9aa] hover:bg-opacity-90 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#1db9aa]/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? 'Authenticating...' : 'Login to Dashboard'}
              <span className="material-icons-round text-xl">arrow_forward</span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account yet? <a className="text-[#1db9aa] font-bold hover:underline" href="#">Start free trial</a>
            </p>
          </div>

          <div className="mt-auto pt-8 flex items-center justify-center gap-6 text-slate-400 dark:text-slate-500">
            <a className="hover:text-slate-600 dark:hover:text-slate-300 text-xs uppercase tracking-widest font-semibold" href="#">Help</a>
            <a className="hover:text-slate-600 dark:hover:text-slate-300 text-xs uppercase tracking-widest font-semibold" href="#">Privacy</a>
            <a className="hover:text-slate-600 dark:hover:text-slate-300 text-xs uppercase tracking-widest font-semibold" href="#">Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;