import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="main-content">
      <section className="empty-state">
        <h1>Page not found</h1>
        <p>The requested page does not exist.</p>
        <Link to="/dashboard" className="button button-secondary">
          Return home
        </Link>
      </section>
    </div>
  );
}
