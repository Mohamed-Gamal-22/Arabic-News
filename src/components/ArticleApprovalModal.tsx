"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ArticleApprovalModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (data: {
    IsTrending: boolean;
    TrendPeriodInDays: number;
  }) => Promise<void>;
  loading?: boolean;
  /** نصوص اختيارية لإعادة استخدام النافذة خارج «موافقة المقال» */
  title?: string;
  description?: string;
  trendingLabel?: string;
  confirmLabel?: string;
};

export default function ArticleApprovalModal({
  open,
  onOpenChange,
  onApprove,
  loading = false,
  title = "موافقة على المقال",
  description = "حدد إعدادات الموافقة على المقال",
  trendingLabel = "جعل المقال تريندينج",
  confirmLabel = "موافق",
}: ArticleApprovalModalProps) {
  const [isTrending, setIsTrending] = useState(false);
  const [trendPeriodInDays, setTrendPeriodInDays] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isTrending && (trendPeriodInDays < 1 || trendPeriodInDays > 365)) {
      setError("عدد الأيام يجب أن يكون بين 1 و 365");
      return;
    }

    try {
      await onApprove({
        IsTrending: isTrending,
        TrendPeriodInDays: isTrending ? trendPeriodInDays : 1,
      });
      // Reset form on success
      setIsTrending(false);
      setTrendPeriodInDays(1);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "حدث خطأ في الموافقة على المقال"
      );
    }
  };

  const handleCancel = () => {
    setIsTrending(false);
    setTrendPeriodInDays(1);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="arabic-text max-w-md">
        <DialogHeader>
          <DialogTitle className="arabic-heading text-right">{title}</DialogTitle>
          <DialogDescription className="arabic-text text-right">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* IsTrending Checkbox */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id="isTrending"
              checked={isTrending}
              onChange={(e) => setIsTrending(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={loading}
            />
            <Label
              htmlFor="isTrending"
              className="text-sm font-medium text-gray-700 cursor-pointer arabic-text"
            >
              {trendingLabel}
            </Label>
          </div>

          {/* TrendPeriodInDays Input - shown only when trending is enabled */}
          {isTrending && (
            <div className="space-y-2">
              <Label htmlFor="trendPeriod" className="arabic-text">
                عدد الأيام للتريندينج *
              </Label>
              <Input
                id="trendPeriod"
                type="number"
                min="1"
                max="365"
                value={trendPeriodInDays}
                onChange={(e) =>
                  setTrendPeriodInDays(parseInt(e.target.value) || 1)
                }
                className="arabic-text"
                placeholder="أدخل عدد الأيام"
                required={isTrending}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 arabic-text">
                يجب أن يكون بين 1 و 365 يوم
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded arabic-text text-sm">
              {error}
            </div>
          )}

          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "جاري المعالجة..." : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
