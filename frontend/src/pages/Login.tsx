import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useValidationError } from '../hooks/useValidationError';
import type { AuthResponse } from '../types';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { fieldErrors, parseError, clearErrors } = useValidationError();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    clearErrors();

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', {
        email: email.toLowerCase().trim(),
        password,
      });

      login(response.data.data);
      navigate('/dashboard');
    } catch (submitError: unknown) {
      console.error('Login error:', submitError);
      const parsed = parseError(submitError);
      setError(parsed._global ?? 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page font-geist">
      <section className="auth-card">
        <div className="text-center mb-6">
          <h1 className="text-primary text-headline-sm font-semibold mb-1">Smart Leads</h1>
          <p className="text-label-md text-on-surface-variant">Enterprise SaaS</p>
        </div>
        <h2 className="text-headline-md font-semibold mb-1">Sign in</h2>
        <p className="subtitle">Enter your email and password to access the dashboard.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              placeholder="you@company.com"
              required
            />
            {fieldErrors.email && <span id="login-email-error" className="text-label-sm text-error">{fieldErrors.email}</span>}
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
              placeholder="••••••••"
              required
            />
            {fieldErrors.password && <span id="login-password-error" className="text-label-sm text-error">{fieldErrors.password}</span>}
          </label>
          {error && (
            <div className="p-3 bg-error-container text-on-error-container text-body-md rounded-lg">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-body-md text-on-surface-variant mt-4">
          New here?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}
