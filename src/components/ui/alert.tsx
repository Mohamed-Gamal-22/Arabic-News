"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "error" | "info" | "warning";
  onClose?: () => void;
  showCloseButton?: boolean;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  };
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", onClose, showCloseButton = true, actionButton, children, ...props }, ref) => {
    const variants = {
      success: {
        container: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
        icon: "text-green-600 dark:text-green-400",
        closeButton: "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200",
        iconSvg: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      },
      error: {
        container: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
        icon: "text-red-600 dark:text-red-400",
        closeButton: "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200",
        iconSvg: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      },
      info: {
        container: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
        icon: "text-blue-600 dark:text-blue-400",
        closeButton: "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200",
        iconSvg: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      warning: {
        container: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
        icon: "text-yellow-600 dark:text-yellow-400",
        closeButton: "text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200",
        iconSvg: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      },
    };

    const currentVariant = variants[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-3 px-4 py-3 rounded-lg border mb-6 arabic-text",
          currentVariant.container,
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
        <div className={cn("shrink-0 mt-0.5", currentVariant.icon)}>
            {currentVariant.iconSvg}
          </div>
          <div className="flex-1">{children}</div>
          {showCloseButton && onClose && !actionButton && (
            <button
              onClick={onClose}
              className={cn(
                "shrink-0 mt-0.5 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                currentVariant.closeButton
              )}
              aria-label="إغلاق"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {actionButton && (
          <div className="flex justify-end">
            <Button
              variant={actionButton.variant || (variant === "success" ? "default" : "outline")}
              size="sm"
              onClick={actionButton.onClick}
              className={
                variant === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : variant === "error"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              {actionButton.label}
            </Button>
          </div>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

