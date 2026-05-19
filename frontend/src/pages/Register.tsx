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
    <div className="main-content">
      <section className="login-card">
        <h1>Create account</h1>
        <p>Register with your email and join the lead management dashboard.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <label>
            Role
            <select className="select-field" value={role} onChange={(event) => setRole(event.target.value as 'Admin' | 'Sales User')}>
              <option value="Sales User">Sales User</option>
              <option value="Admin">Admin</option>
            </select>
          </label>
          {error ? <div className="error-state">{error}</div> : null}
          <button type="submit" className="button button-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
