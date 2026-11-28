import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error) {
    return {hasError: true, error};
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-slate-950">
          <div className="max-w-md text-center">
            <h1 className="text-lg font-semibold text-ink dark:text-white">
              Terjadi kesalahan
            </h1>
            <p className="mt-2 text-sm text-muted dark:text-slate-400">
              {this.state.error?.message || "Unknown error"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-ink px-4 py-2 text-sm text-white
                dark:bg-white dark:text-ink"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
