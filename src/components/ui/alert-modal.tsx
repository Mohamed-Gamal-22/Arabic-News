"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AlertModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  };
}

export function AlertModal({
  open,
  onOpenChange,
  variant = "info",
  title,
  message,
  actionButton,
}: AlertModalProps) {
  const variants = {
    success: {
      titleColor: "text-green-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      buttonClass: "bg-green-600 hover:bg-green-700",
    },
    error: {
      titleColor: "text-red-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      buttonClass: "bg-red-600 hover:bg-red-700",
    },
    info: {
      titleColor: "text-blue-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      buttonClass: "bg-blue-600 hover:bg-blue-700",
    },
    warning: {
      titleColor: "text-yellow-600",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      buttonClass: "bg-yellow-600 hover:bg-yellow-700",
    },
  };

  const currentVariant = variants[variant];
  const defaultTitle =
    variant === "success"
      ? "تم بنجاح!"
      : variant === "error"
      ? "حدث خطأ!"
      : variant === "warning"
      ? "تحذير!"
      : "معلومة";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="arabic-text max-w-md">
        <DialogHeader>
          <DialogTitle
            className={cn(
              "flex items-center gap-3 space-x-reverse",
              currentVariant.titleColor
            )}
          >
            <div className={currentVariant.titleColor}>{currentVariant.icon}</div>
            <span>{title || defaultTitle}</span>
          </DialogTitle>
          <DialogDescription className="arabic-text text-lg mt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 space-x-reverse mt-4">
          {actionButton ? (
            <Button
              variant={actionButton.variant || "default"}
              onClick={actionButton.onClick}
              className={cn(
                actionButton.variant === "default" || !actionButton.variant
                  ? currentVariant.buttonClass
                  : ""
              )}
            >
              {actionButton.label}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => onOpenChange?.(false)}
            >
              إغلاق
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


