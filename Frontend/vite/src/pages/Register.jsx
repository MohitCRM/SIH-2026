import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserCircle, Lock, User, Type, Eye, EyeOff } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    role: 'STUDENT',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to login after successful registration
        navigate('/');
      } else {
        setError(data.message || t('register.errors.registerFailed'));
      }
    } catch (err) {
      setError(t('common.networkError'));
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
             <UserCircle size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-base-content">
            {t('register.title')}
          </h1>
          <p className="text-base-content/60">
            {t('register.subtitle')}
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl fade-in delay-100">
          <div className="card-body">
            <form onSubmit={handleRegister}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t('register.fullNameLabel')}</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Type size={18} className="text-base-content/40" />
                  </div>
                  <input 
                    type="text" 
                    name="fullName"
                    placeholder={t('register.fullNamePlaceholder')} 
                    className="input input-bordered w-full pl-10" 
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">{t('common.userId')}</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-base-content/40" />
                  </div>
                  <input 
                    type="text" 
                    name="userId"
                    placeholder={t('register.userIdPlaceholder')} 
                    className="input input-bordered w-full pl-10" 
                    value={formData.userId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">{t('common.password')}</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-base-content/40" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    placeholder={t('register.passwordPlaceholder')} 
                    className="input input-bordered w-full pl-10 pr-10" 
                    value={formData.password}
                    onChange={handleChange}
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

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">{t('register.roleLabel')}</span>
                </label>
                <select 
                  name="role" 
                  className="select select-bordered w-full"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="STUDENT">{t('register.roles.student')}</option>
                  <option value="NODAL_OFFICER">{t('register.roles.nodalOfficer')}</option>
                  <option value="MINISTRY_ADMIN">{t('register.roles.ministryAdmin')}</option>
                </select>
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
                  {loading ? t('register.submitting') : t('register.submit')}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center text-sm text-base-content/60">
              <p>{t('register.haveAccount')} <Link to="/" className="link link-primary">{t('register.signInLink')}</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
