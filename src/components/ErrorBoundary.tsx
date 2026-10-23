import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  componentStack: string | null;
}

/**
 * Catches render errors in a page. Production shows a friendly message;
 * development shows the full exception and component stack.
 * Remount it with a `key` (e.g. the pathname) to reset after navigation.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, componentStack: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ componentStack: info.componentStack ?? null });
    console.error(error, info.componentStack);
  }

  render() {
    const { error, componentStack } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-32 pb-24 px-6">
          <div className="container-narrow">
            <h1 className="text-display mb-6 font-heading">Something broke</h1>
            <p className="text-xl text-muted-foreground mb-8">
              This page hit an unexpected error. Try reloading, or head back home.
            </p>
            <div className="flex gap-6 mb-12">
              <button
                onClick={() => window.location.reload()}
                className="text-primary link-underline"
              >
                Reload
              </button>
              <Link to="/" className="text-primary link-underline">
                Go home
              </Link>
            </div>

            {import.meta.env.DEV && (
              <div className="space-y-4">
                <pre className="bg-card border border-destructive/50 rounded-lg p-4 text-sm text-destructive whitespace-pre-wrap break-words">
                  {error.name}: {error.message}
                </pre>
                {error.stack && (
                  <details open>
                    <summary className="text-sm text-muted-foreground cursor-pointer mb-2">
                      Stack trace
                    </summary>
                    <pre className="bg-card border border-border rounded-lg p-4 text-xs overflow-x-auto">
                      {error.stack}
                    </pre>
                  </details>
                )}
                {componentStack && (
                  <details>
                    <summary className="text-sm text-muted-foreground cursor-pointer mb-2">
                      Component stack
                    </summary>
                    <pre className="bg-card border border-border rounded-lg p-4 text-xs overflow-x-auto">
                      {componentStack.trim()}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }
}

export default ErrorBoundary;
