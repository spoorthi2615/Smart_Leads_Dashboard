import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="auth-page font-geist">
      <section className="text-center">
        <span className="material-symbols-outlined text-[64px] text-error/30 mb-4 block">lock</span>
        <h1 className="text-headline-lg text-on-surface mb-2">Access denied</h1>
        <p className="text-body-md text-on-surface-variant mb-6">You do not have permission to view that resource.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-medium hover:bg-primary/90 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to dashboard
        </Link>
      </section>
    </div>
  );
}
