import React, { Component, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  title?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ComponentErrorBoundary] Caught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400 mb-3">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-foreground">
            {this.props.title || "Panel Render Interrupted"}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
            {this.state.error?.message || "An unexpected error occurred in this view. Other tools and your active prompt input remain safe."}
          </p>
          <Button
            size="sm"
            onClick={this.handleReset}
            className="mt-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-sm"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Retry Rendering Panel
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
