import React from "react";

export class GlobeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Globe Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto aspect-[1/1] w-full max-w-[600px] flex items-center justify-center p-4 bg-neutral-900/50 rounded-lg">
          <div className="text-center text-white text-sm">
            <p>Globe visualization encountered an error.</p>
            <p className="text-neutral-400 mt-2 text-xs">
              {this.state.error?.message || "Unknown error"}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
