import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, User, Eye, EyeOff } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Save user to localStorage (Level 1 simple auth)
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role (Option A)
        if (data.user.role === 'MINISTRY_ADMIN') {
          navigate('/ministry');
        } else if (data.user.role === 'NODAL_OFFICER') {
          navigate('/officer');
        } else {
          navigate('/applicant');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base-200">
      <div className="fixed top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      
      <div className="max-w-md w-full">
        <div className="text-center mb-8 fade-in">
          <div className="mb-4 mx-auto w-16 h-16 border-4 border-primary rounded-full flex items-center justify-center text-primary bg-primary/10">
             <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-base-content">
            Centralized Portal
          </h1>
          <p className="text-base-content/60">
            Sign in to access your dashboard
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl fade-in delay-100">
          <div className="card-body">
            <form onSubmit={handleLogin}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">User ID</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-base-content/40" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter your User ID" 
                    className="input input-bordered w-full pl-10" 
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-base-content/40" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter password" 
                    className="input input-bordered w-full pl-10 pr-10" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/40 hover:text-base-content"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-error text-sm mt-4 text-center">
                  {error}
                </div>
              )}

              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center text-sm text-base-content/60">
              <p>Don't have an account? <Link to="/register" className="link link-primary">Register here</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
