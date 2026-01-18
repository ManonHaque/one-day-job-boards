"use client";

import React, { Component, ReactNode } from "react";
import toast from "react-hot-toast";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    toast.error("Something went wrong. Please refresh the page.");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black/[0.96] flex items-center justify-center p-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-neutral-400 mb-6">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
export default ErrorBoundary;

