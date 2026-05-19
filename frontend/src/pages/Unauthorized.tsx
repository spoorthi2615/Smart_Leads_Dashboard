import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="main-content">
      <section className="empty-state">
        <h1>Access denied</h1>
        <p>You do not have permission to view that resource.</p>
        <Link to="/dashboard" className="button button-secondary">
          Back to dashboard
        </Link>
      </section>
    </div>
  );
}
