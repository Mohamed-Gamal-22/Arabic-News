"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  // إظهار أرقام الصفحات
  const getVisiblePages = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    const safeTotalPages = Math.max(1, totalPages);

    if (safeTotalPages <= maxVisible) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= safeTotalPages - 2) {
        for (let i = safeTotalPages - 4; i <= safeTotalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const safeTotalPages = Math.max(1, totalPages);

  // تحديد إذا كانت في أول صفحة أو آخر صفحة
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= safeTotalPages;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* زر الصفحة الأولى - disabled في أول صفحة */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={isFirstPage}
        className="arabic-text"
      >
        الأولى
      </Button>

      {/* زر الصفحة السابقة - disabled في أول صفحة */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        className="arabic-text"
      >
        السابقة
      </Button>

      {/* أرقام الصفحات */}
      {visiblePages[0] > 1 && (
        <>
          <span className="px-3 py-1 text-sm text-gray-500">...</span>
        </>
      )}

      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          className="arabic-text"
        >
          {page}
        </Button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          <span className="px-3 py-1 text-sm text-gray-500">...</span>
        </>
      )}

      {/* زر الصفحة التالية - disabled في آخر صفحة */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className="arabic-text"
      >
        التالية
      </Button>

      {/* زر الصفحة الأخيرة - disabled في آخر صفحة */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={isLastPage}
        className="arabic-text"
      >
        الأخيرة
      </Button>
    </div>
  );
}
