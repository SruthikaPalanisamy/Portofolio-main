import React from "react";

export class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Canvas Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-neutral-900/30 backdrop-blur-sm">
          <div className="text-center text-white">
            <p className="text-sm font-medium">3D Graphics unavailable</p>
            <p className="text-neutral-400 mt-2 text-xs max-w-xs">
              {this.state.error?.message || "WebGL context could not be created"}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
