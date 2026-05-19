import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Sales User'>('Sales User');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/register', {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
      });

      login(response.data.data);
      navigate('/dashboard');
    } catch (submitError) {
      console.error('Register error:', submitError);
      setError('Registration failed. Please review your data and try again.');
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
        <h2 className="text-headline-md font-semibold mb-1">Create account</h2>
        <p className="subtitle">Register with your email and join the lead management dashboard.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="John Doe"
              required
            />
          </label>
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
          <label>
            Role
            <select value={role} onChange={(event) => setRole(event.target.value as 'Admin' | 'Sales User')}>
              <option value="Sales User">Sales User</option>
              <option value="Admin">Admin</option>
            </select>
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
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-body-md text-on-surface-variant mt-4">
          Already registered?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
}
