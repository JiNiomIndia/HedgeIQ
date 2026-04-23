import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; label?: string; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.label ?? 'widget'}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ color: 'var(--neg)', fontWeight: 700, marginBottom: 8 }}>
            {this.props.label ?? 'Widget'} encountered an error
          </p>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 12 }}>
            {this.state.error?.message ?? 'Unknown error'}
          </p>
          <button className="btn btn-sm btn-ghost"
            onClick={() => this.setState({ hasError: false, error: null })}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
