import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useValidationError } from '../hooks/useValidationError';
import type { AuthResponse } from '../types';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Briefcase, ArrowRight } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Sales User'>('Sales User');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { fieldErrors, parseError, clearErrors } = useValidationError();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    clearErrors();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
      });

      login(response.data.data);
      navigate('/leads'); // navigated to leads since dashboard is removed
    } catch (submitError: unknown) {
      console.error('Register error:', submitError);
      const parsed = parseError(submitError);
      setError(parsed._global ?? 'Registration failed. Please review your data and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-slate-900 p-4 transition-colors">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-outline-variant dark:border-slate-700 my-8"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-primary dark:text-primary-fixed-dim font-bold text-xl">S</span>
          </motion.div>
          <h1 className="text-2xl font-bold text-on-surface dark:text-white mb-2">Create an account</h1>
          <p className="text-on-surface-variant dark:text-slate-400">Join the Smart Leads dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant dark:text-slate-300 mb-1.5">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50 dark:text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/40"
                placeholder="John Doe"
                required
              />
            </div>
            {fieldErrors.name && <p className="mt-1 text-sm text-error">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant dark:text-slate-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50 dark:text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/40"
                placeholder="you@company.com"
                required
              />
            </div>
            {fieldErrors.email && <p className="mt-1 text-sm text-error">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50 dark:text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/40"
                placeholder="••••••••"
                required
              />
            </div>
            {fieldErrors.password && <p className="mt-1 text-sm text-error">{fieldErrors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant dark:text-slate-300 mb-1.5">
              Role
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50 dark:text-slate-500 z-10" />
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as 'Admin' | 'Sales User')}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
              >
                <option value="Sales User">Sales User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-error/10 text-error text-sm rounded-lg border border-error/20 mt-2"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 mt-2 bg-primary text-white rounded-lg font-medium shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? 'Creating account...' : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-primary dark:text-primary-fixed-dim font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
