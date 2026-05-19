import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password,
      });

      login(response.data.data);
      navigate('/dashboard');
    } catch (submitError) {
      console.error('Login error:', submitError);
      setError('Login failed. Please check your credentials and try again.');
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
              placeholder="you@company.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
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
