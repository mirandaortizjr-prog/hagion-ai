import React from "react";

interface Props { children: React.ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App crashed:", error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center text-foreground">
          <h1 className="font-playfair text-xl">Something went wrong</h1>
          <p className="text-sm text-muted-foreground max-w-sm break-words">
            {this.state.error.message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ error: null })}
              className="rounded-full border border-border px-5 py-2 text-sm"
            >
              Try again
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm"
            >
              Go home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
