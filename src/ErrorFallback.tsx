import React from 'react'
import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { Warning, ArrowClockwise } from "@phosphor-icons/react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  console.error('Error boundary triggered:', error)
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="mb-6">
          <Warning />
          <AlertTitle>Application encountered an error</AlertTitle>
          <AlertDescription>
            Something unexpected happened. You can try reloading or check the console for more details.
          </AlertDescription>
        </Alert>
        
        <div className="bg-card border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Error Details:</h3>
          <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-32">
            {error.message}
          </pre>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={resetErrorBoundary} 
            className="w-full"
            variant="outline"
          >
            <ArrowClockwise />
            Try Again
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
            size="sm"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}
