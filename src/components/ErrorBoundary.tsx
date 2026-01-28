import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Attempt to recover by reloading the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                <AlertTriangle
                  className="w-8 h-8 text-destructive"
                  strokeWidth={2}
                />
              </div>
              <h1 className="text-2xl font-bold mb-2">Oops! Something broke</h1>
              <p className="text-muted-foreground">
                Moltz ran into an unexpected problem. Don't worry — your conversations are safe and encrypted.
              </p>
            </div>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground mb-2">
                  Error Details
                </summary>
                <div className="bg-muted rounded-lg p-4 text-xs font-mono overflow-auto max-h-48">
                  <p className="text-destructive mb-2 font-bold">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-muted-foreground whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <Button
              onClick={this.handleReset}
              variant="primary"
              size="lg"
              leftIcon={<RefreshCw className="w-5 h-5" />}
              className="shadow-lg hover:shadow-xl"
            >
              Reload Application
            </Button>

            <p className="mt-4 text-xs text-muted-foreground">
              If this keeps happening, try checking Settings or restarting the app. Your data is always safe.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
