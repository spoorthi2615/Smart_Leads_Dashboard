import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-page font-geist">
      <section className="text-center">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30 mb-4 block">explore_off</span>
        <h1 className="text-headline-lg text-on-surface mb-2">Page not found</h1>
        <p className="text-body-md text-on-surface-variant mb-6">The requested page does not exist.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-medium hover:bg-primary/90 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Return home
        </Link>
      </section>
    </div>
  );
}
