import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled React error:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-on-surface font-geist flex items-center justify-center p-6">
          <section className="max-w-md w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center shadow-soft">
            <span className="material-symbols-outlined text-[48px] text-error mb-4 block">error</span>
            <h1 className="text-headline-sm mb-2">Something went wrong</h1>
            <p className="text-body-md text-on-surface-variant mb-6">
              The dashboard hit an unexpected error. Refresh the page to continue.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-medium hover:bg-primary/90 transition-all"
            >
              Refresh
            </button>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}
