import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
          <div className="font-display font-bold text-xl text-ink mb-2">Something went wrong</div>
          <div className="text-sm text-muted mb-4">{this.state.error.message}</div>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
            className="h-11 px-6 rounded-xl bg-accent text-white font-semibold text-sm"
          >
            Go back to home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
